import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as types from "./types";
import axios, { AxiosResponse } from "axios";
import {
    ProjectManagementTreeItem,
    findProjectKeyOfCycleElement,
    ProjectManagementTreeDataProvider,
} from "./projectManagementTreeView";
import * as tb2robotLib from "./testbench2robotframeworkLib";
import { connection, baseKey, lastGeneratedReportParams } from "./extension";

/**
 * Prompt the user to select the export report method in quick pick format (Execution based or Specification based).
 * @returns Promise<boolean | null> - Resolves with the selected option (true for Execution based, false for Specification based) or null if the user cancels the selection.
 */
export async function isExecutionBasedReportSelected(): Promise<boolean | null> {
    // Return a Promise, which will resolve with the result after user interaction
    return new Promise((resolve) => {
        // Create the quick pick input
        const quickPick = vscode.window.createQuickPick();
        quickPick.items = [{ label: "Execution based" }, { label: "Specification based" }, { label: "Cancel" }];
        quickPick.title = "Select Export Option";
        quickPick.placeholder = "Select the export option for the reports.";

        // Handle the user selection
        quickPick.onDidChangeSelection((selection) => {
            if (selection[0]) {
                if (selection[0].label === "Cancel") {
                    resolve(null); // Resolve with null if the user selects "Cancel"
                } else {
                    resolve(selection[0].label === "Execution based"); // Resolve with the selected option
                }
                quickPick.hide(); // Close the quick pick after selection
            }
        });

        // Handle case when the quick pick is hidden without user selection (e.g., if user clicks away)
        quickPick.onDidHide(() => {
            resolve(null);
            quickPick.dispose(); // Clean up resources after closing
        });

        quickPick.show(); // Show the quick pick to the user
    });
}

// Checks if the report job has completed successfully.
export function isReportJobCompletedSuccessfully(jobStatus: types.JobStatusResponse): boolean {
    return !!jobStatus?.completion?.result?.ReportingSuccess?.reportName;
}

// Checks if the import job has completed successfully.
export function isImportJobCompletedSuccessfully(jobStatus: types.JobStatusResponse): boolean {
    return !!jobStatus?.completion?.result?.ExecutionImportingSuccess;
}

// Checks if the import job has failed.
export function isImportJobFailed(jobStatus: types.JobStatusResponse): boolean {
    return !!jobStatus?.completion?.result?.ExecutionImportingFailure;
}

/**
 * Fetch the TestBench JSON report (ZIP Archive) from the server.
 * 3 Calls are needed to download the zip report:
 * 1. Get the job ID
 * 2. Get the job status (polling until the job is completed)
 * 3. Download the report zip file.
 *
 * @param baseKey The base key of the extension
 * @param projectKey The project key
 * @param cycleKey The cycle key
 * @param progress Progress bar to show the poll attempts to the user
 * @param folderNameToDownloadReport The folder name to save the downloaded report
 * @param requestParams Optional request parameters (exec/spec based, root UID) for the job ID request
 * @param cancellationToken Cancellation token to be able to cancel the polling by clicking cancel button
 * @returns The path of the downloaded zip file if the download was successful, otherwise undefined
 */
export async function fetchZipFile(
    baseKey: string,
    projectKey: string,
    cycleKey: string,
    folderNameToDownloadReport: string,
    requestParams?: types.OptionalJobIDRequestParameter,
    progress?: vscode.Progress<{ message?: string; increment?: number }>,
    cancellationToken?: vscode.CancellationToken
): Promise<string | undefined> {
    try {
        if (!connection) {
            console.error("Connection object is missing.");
            return undefined;
        }

        console.log(
            `Fetching report for projectKey: ${projectKey}, cycleKey: ${cycleKey}, requestParams: ${requestParams}, folderNameToDownloadReport: ${folderNameToDownloadReport}.`
        );
        console.log("requestParams", requestParams);

        const jobId = await getJobId(projectKey, cycleKey, requestParams);
        if (!jobId) {
            console.warn("Job ID not received.");
            return undefined;
        }
        console.log(`Job ID (${jobId}) fetched successfully.`);

        const jobStatus = await pollJobStatus(projectKey, jobId, "report", progress, cancellationToken);

        if (!jobStatus || !isReportJobCompletedSuccessfully(jobStatus)) {
            console.warn("Report generation was unsuccessful.");
            vscode.window.showErrorMessage("Report generation was unsuccessful.");
            return undefined;
        }

        const fileName = jobStatus.completion.result.ReportingSuccess!.reportName;
        console.log(`Report name: ${fileName}`);

        const outputPath = await downloadReport(baseKey, projectKey, fileName, folderNameToDownloadReport);
        if (outputPath) {
            console.log(`Report downloaded and saved to: ${outputPath}`);
            return outputPath;
        } else {
            console.warn("Download canceled or failed.");
        }
    } catch (error) {
        if (error instanceof vscode.CancellationError) {
            console.log("Operation cancelled by the user.");
            vscode.window.showInformationMessage("Operation cancelled by the user.");
            return undefined;
        } else {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                throw new Error("Resource not found.");
            } else {
                console.error(`Error fetching the report for project ${projectKey} and cycle ${cycleKey}: ${error}`);
                throw error;
            }
        }
    }
}

/**
 * Poll the job status (Either report of import job) until the job is completed.
 * @param connection Connection object to the server
 * @param projectKey Project key
 * @param jobId Job ID received from the server
 * @param jobType Type of job (report or import)
 * @param progress Progress bar to show the poll attempts to the user
 * @param cancellationToken Cancellation token to be able to cancel the polling by clicking cancel button
 * @param maxPollingTimeMs Maximum time to poll the job status, after which the polling will be stopped
 * @returns Job status response object if the job is completed, otherwise null
 */
export async function pollJobStatus(
    projectKey: string,
    jobId: string,
    jobType: "report" | "import",
    progress?: vscode.Progress<{ message?: string; increment?: number }>,
    cancellationToken?: vscode.CancellationToken,
    maxPollingTimeMs?: number // Optional timeout, disabled by default so that the user can cancel manually
): Promise<types.JobStatusResponse | null> {
    const startTime = Date.now(); // Start time for the polling to adjust the polling interval after 10 seconds
    let attempt = 0;
    let jobStatus: types.JobStatusResponse | null = null;

    // Poll the job status until the job is completed with either success or failure
    while (true) {
        if (cancellationToken?.isCancellationRequested) {
            console.log("Operation cancelled by the user.");
            vscode.window.showInformationMessage("Operation cancelled by the user.");
            throw new vscode.CancellationError();
        }

        if (!connection) {
            console.error("Connection object is missing.");
            return null;
        }

        attempt++;

        try {
            jobStatus = await getJobStatus(projectKey, jobId, jobType);
            if (!jobStatus) {
                console.warn("Job status not received.");
                return null;
            }

            console.log(`Attempt ${attempt}: Job Status fetched.`);

            if (jobType === "report") {
                if (isReportJobCompletedSuccessfully(jobStatus)) {
                    console.log("Report job completed successfully.");
                    return jobStatus;
                } else {
                    // console.log("Job not yet completed.");
                }
            } else if (jobType === "import") {
                if (isImportJobCompletedSuccessfully(jobStatus)) {
                    console.log("Import job completed successfully.");
                    return jobStatus;
                } else if (isImportJobFailed(jobStatus)) {
                    return null;
                }
            }
        } catch (error) {
            console.error(`Attempt ${attempt}: Failed to get job status. Error: ${error}`);
        }

        if (progress) {
            progress.report({
                message: `Fetching Job status. Attempt ${attempt}.`,
            });
        }

        // (Optional) Check if the maximum polling time has been exceeded.
        if (maxPollingTimeMs !== undefined) {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime >= maxPollingTimeMs) {
                console.warn("Maximum polling time exceeded. Aborting job status polling.");
                break;
            }
        }

        // Adjust polling interval based on elapsed time.
        // For the first 10 seconds, poll every 200 ms, then poll every 1 second.
        const elapsedTime = Date.now() - startTime;
        const delayMs = elapsedTime < 10000 ? 200 : 1000;
        // console.log(`Waiting ${delayMs} ms before next attempt.`);
        await delay(delayMs);
    }

    return jobStatus;
}

/**
 * Get the job ID from server for the report or import job.
 * @param projectKey The project key
 * @param cycleKey The cycle key
 * @param requestParams Optional request parameters (exec/spec based, root UID) for the job ID request
 * @returns The job ID received from the server
 */
export async function getJobId(
    projectKey: string,
    cycleKey: string,
    requestParams?: types.OptionalJobIDRequestParameter
): Promise<string | null> {
    if (!connection) {
        console.error("Connection object is missing.");
        return "";
    }

    const url = `${connection.getBaseURL()}/projects/${projectKey}/cycles/${cycleKey}/report/v1`;

    console.log(
        `Sending request to fetch job ID for projectKey: ${projectKey}, cycleKey: ${cycleKey} to the URL ${url}.`
    );

    const jobIdResponse: AxiosResponse<types.JobIdResponse> = await axios.post(url, requestParams, {
        headers: {
            accept: "application/json",
            Authorization: connection.getSessionToken(), // Include session token for authorization
            "Content-Type": "application/json",
        },
    });

    console.log("jobIdResponse:", jobIdResponse);

    if (jobIdResponse.status !== 200) {
        throw new Error(`Failed to fetch job ID, status code: ${jobIdResponse.status}`);
    }

    return jobIdResponse.data.jobID;
}

/**
 * Get the job status from server
 * @param connection Connection object to the server
 * @param projectKey The project key
 * @param jobId The job ID received from the server
 * @param jobType The type of job (report or import)
 * @returns The job status response object
 */
export async function getJobStatus(
    projectKey: string,
    jobId: string,
    jobType: "report" | "import"
): Promise<types.JobStatusResponse | null> {
    if (!connection) {
        console.error("Connection object is missing.");
        return null;
    }

    const url = `${connection.getBaseURL()}/projects/${projectKey}/${jobType}/job/${jobId}/v1`;

    console.log(`Checking job status: ${url}`);

    const jobStatusResponse: AxiosResponse<types.JobStatusResponse> = await axios.get(url, {
        headers: {
            accept: "application/vnd.testbench+json",
            Authorization: connection.getSessionToken(),
        },
    });

    console.log("jobStatusResponse:", jobStatusResponse);

    if (jobStatusResponse.status !== 200) {
        throw new Error(`Failed to fetch job status, status code: ${jobStatusResponse.status}`);
    }

    return jobStatusResponse.data;
}

/**
 * Download the report zip file from the server to local storage and return the path of the downloaded file.
 * @param baseKey  The base key of the extension
 * @param projectKey The project key
 * @param fileName The name of the report file to download
 * @param folderNameToDownloadReport  The folder name to save the downloaded report
 * @returns The path of the downloaded zip file if the download was successful, otherwise undefined
 */
export async function downloadReport(
    baseKey: string,
    projectKey: string,
    fileName: string,
    folderNameToDownloadReport: string
): Promise<string | undefined> {
    if (!connection) {
        console.error("Connection object is missing.");
        return undefined;
    }

    const url = `${connection.getBaseURL()}/projects/${projectKey}/report/${fileName}/v1`;

    console.log(`Sending request to download report ${fileName} to URL ${url}.`);

    const downloadZipResponse = await axios.get(url, {
        responseType: "arraybuffer", // Expecting binary data
        headers: {
            accept: "application/vnd.testbench+json",
            Authorization: connection.getSessionToken(),
        },
    });

    if (downloadZipResponse.status !== 200) {
        throw new Error(`Failed to download report, status code: ${downloadZipResponse.status}`);
    }

    // Select the output directory to save the report
    const config = vscode.workspace.getConfiguration(baseKey);
    const workspaceLocation = config.get<string>("workspaceLocation");
    if (workspaceLocation) {
        if (fs.existsSync(workspaceLocation)) {
            // console.log(`Using configuration as download location: ${workspaceLocation}`);
            async function saveReportToFile(
                downloadZipResponse: AxiosResponse<any>,
                workspaceLocation: string,
                fileName: string
            ): Promise<string | undefined> {
                const uri = vscode.Uri.file(path.join(workspaceLocation, folderNameToDownloadReport, fileName));
                return vscode.workspace.fs.writeFile(uri, new Uint8Array(downloadZipResponse.data)).then(() => {
                    // vscode.window.showInformationMessage(`Report downloaded successfully to ${uri.fsPath}`);
                    return uri.fsPath;
                });
            }

            return await saveReportToFile(downloadZipResponse, workspaceLocation, fileName);
        } else {
            console.error(`The configured download location does not exist: ${workspaceLocation}`);
            vscode.window.showErrorMessage(`The configured workspace location does not exist: ${workspaceLocation}`);
        }
    }

    console.log(`Using download location manually selected by the user.`);

    const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(fileName),
        filters: { "Zip Files": ["zip"] },
    });

    if (uri) {
        try {
            // Check if the file already exists
            await vscode.workspace.fs.stat(uri);

            // If file exists, ask user if they want to overwrite or skip
            const overwriteOption = await vscode.window.showWarningMessage(
                `The file "${fileName}" already exists. Do you want to overwrite it?`,
                { modal: true },
                "Overwrite",
                "Skip"
            );

            if (overwriteOption === "Skip") {
                vscode.window.showInformationMessage("File download skipped.");
                return undefined; // Return if the user chooses to skip
            }
        } catch (error) {
            // If the error is because the file does not exist, we proceed with writing
            if ((error as vscode.FileSystemError).code !== "FileNotFound") {
                throw error; // Re-throw any other errors
            }
        }

        await vscode.workspace.fs.writeFile(uri, new Uint8Array(downloadZipResponse.data));
        // vscode.window.showInformationMessage(`Report downloaded successfully to ${uri.fsPath}`);
        return uri.fsPath; // Return the path of the saved file
    }
    return undefined; // Return undefined if no file was saved
}

// Utility function for adding delay in milliseconds
export function delay(ms: number): Promise<void> {
    // console.log(`Waiting for ${ms} milliseconds for Job completion.`);
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleExecutionError(
    workingDirectoryFullPath: string,
    isExecutionSuccessfull: boolean,
    downloadedReportZipFilePath: string
): Promise<boolean> {
    if (!isExecutionSuccessfull) {
        await deleteConfigurationFile(getConfigurationFilePath(workingDirectoryFullPath)); // Delete created json config file after usage
        await removeReportZipFile(downloadedReportZipFilePath);
        console.error(`Test generation failed.`);
        // vscode.window.showErrorMessage(`Test generation failed.`);
    }
    return isExecutionSuccessfull;
}

/**
 * Generate Robot Framework test cases from the TestBench JSON report.
 * @param treeItem The selected tree item
 * @param itemLabel The label of the selected tree item
 * @param baseKey The base key of the extension
 * @param projectKey The project key
 * @param cycleKey The cycle key
 * @param workingDirectory The path to save the downloaded report
 * @param UIDofTestThemeElementToGenerateTestsFor (Optinal) The uniqueID of the clicked TestThemeNode element to generate tests for
 * @returns Promise<void>
 */
export async function generateTestsWithTestBenchToRobotFramework(
    context: vscode.ExtensionContext,
    treeItem: ProjectManagementTreeItem,
    itemLabel: string,
    baseKey: string,
    projectKey: string,
    cycleKey: string,
    workingDirectory: string,
    projectManagementTreeDataProvider: ProjectManagementTreeDataProvider, // TODO
    UIDofTestThemeElementToGenerateTestsFor?: string
): Promise<void> {
    // Execution based or specification based request parameter
    const executionBased = await isExecutionBasedReportSelected();
    // console.log("executionBased value set to:", executionBased);
    if (executionBased === null) {
        console.log(`Test generation aborted.`);
        vscode.window.showInformationMessage(`Test generation aborted.`);
        return;
    }

    /* 
    Code for storing treeItem variable as a json file to analyze its structure while removing its parent property to avoid circular reference
    // Function to remove the parent property from an object recursively
    function removeParentProperty(obj: any): any {
        if (Array.isArray(obj)) {
            return obj.map(removeParentProperty);
        } else if (obj !== null && typeof obj === "object") {
            const newObj: any = {};
            for (const key in obj) {
                if (key !== "parent") {
                    newObj[key] = removeParentProperty(obj[key]);
                }
            }
            return newObj;
        }
        return obj;
    }
    // Remove the parent property from treeItem
    const treeItemWithoutParent = removeParentProperty(treeItem);
    // Save the contents of the variable called treeItemWithoutParent to a file called treeItem.json
    const treeItemJsonPath = path.join(getWorkspaceFolder(), "treeItem.json");
    await fs.promises.writeFile(treeItemJsonPath, JSON.stringify(treeItemWithoutParent, null, 2), "utf8");
    */

    // Display all TestThemeNode elements in a QuickPick and return the uniqueID of the selected item
    // to generate tests for only that item or generate all tests.
    async function showTestThemeNodes(treeItem: any): Promise<string | undefined> {
        // Recursively find all TestThemeNode elements in treeItem
        function findTestThemeNodes(node: any, results: { name: string; uniqueID: string; numbering?: string }[] = []) {
            if (node.item?.elementType === "TestThemeNode") {
                const name = node.item.base?.name || "Unnamed";
                const uniqueID = node.item.base?.uniqueID || "No ID";
                const numbering = node.item.base?.numbering;
                results.push({ name, uniqueID, numbering });
            }

            if (Array.isArray(node.children)) {
                node.children.forEach((child: any) => findTestThemeNodes(child, results));
            }

            return results;
        }

        const testThemeNodes = findTestThemeNodes(treeItem);

        // Map the found nodes to a QuickPick items array
        const quickPickItems = [
            { label: "Generate all", description: "Generate All Tests Under The Test Cycle" }, // "Generate all" option is displayed first
            ...testThemeNodes.map((node) => ({
                label: node.numbering ? `${node.numbering} ${node.name}` : node.name,
                description: `ID: ${node.uniqueID}`,
                uniqueID: node.uniqueID,
            })),
        ];

        // Show the QuickPick prompt and return the uniqueID of the selected item
        const selected = await vscode.window.showQuickPick(quickPickItems, {
            placeHolder: 'Select a test theme or select "Generate all" to generate all tests under the cycle.',
        });

        if (!selected) {
            return undefined;
        }

        // Return "Generate all" if that option was selected, otherwise the uniqueID
        return selected?.label === "Generate all" ? "Generate all" : (selected as { uniqueID: string }).uniqueID;
    }

    // If the user clicks "Generate Test Cases" button for a test theme, its UID is automatically passed to this function.
    // If the user clicks "Generate Test Cases" button for a test cycle, list and get the uniqueID of the selected TestThemeNode element
    let UIDofSelectedElement;
    if (UIDofTestThemeElementToGenerateTestsFor) {
        UIDofSelectedElement = UIDofTestThemeElementToGenerateTestsFor;
    } else {
        UIDofSelectedElement = await showTestThemeNodes(treeItem);
    }

    if (!UIDofSelectedElement) {
        console.error(`Test theme selection was empty.`);
        // vscode.window.showWarningMessage(`Test theme selection was empty.`);
        return;
    }

    const cycleStructureOptionsRequestParameter: types.OptionalJobIDRequestParameter = {
        basedOnExecution: executionBased,
        treeRootUID: UIDofSelectedElement === "Generate all" ? "" : UIDofSelectedElement,
    };

    // console.log(`Started Test generation.`);
    // vscode.window.showInformationMessage(`Started Test generation.`);

    // Show a progress bar while the process is running, since this process takes time
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: `Generating Tests for ${itemLabel}`,
            cancellable: true,
        },
        async (progress, cancellationToken) => {
            try {
                if (progress) {
                    progress.report({
                        increment: 20,
                        message: `Fetching JSON Report from the server.`,
                    });
                }

                // Fetch the ZIP file from the server, passing the cancellationToken
                const downloadedReportZipFilePath = await fetchZipFile(
                    baseKey,
                    projectKey,
                    cycleKey,
                    workingDirectory,
                    cycleStructureOptionsRequestParameter,
                    progress,
                    cancellationToken // Pass the cancellationToken here
                );

                if (!downloadedReportZipFilePath) {
                    console.warn("Download canceled or failed.");
                    return; // Exit if the download was canceled or failed
                }

                if (progress) {
                    progress.report({
                        increment: 20,
                        message: `Generating test cases with testbench2robotframework.`,
                    });
                }

                // @@ Start of testbench2robotframework library
                const config = vscode.workspace.getConfiguration(baseKey);
                const workspacePath = config.get<string>("workspaceLocation");
                const workingDirectoryFullPath = path.join(workspacePath!, workingDirectory);

                // Create configuration json object called testbench2robotframeworkConfig.json
                const tb2robotConfigFilePath = await saveTestbench2RobotConfigurationAsJson(
                    baseKey,
                    workingDirectoryFullPath
                );

                // Stop execution if any of the commands fails
                let isExecutionSuccessfull = true;
                if (!tb2robotConfigFilePath) {
                    isExecutionSuccessfull = await tb2robotLib.startTb2robotWrite(
                        context,
                        workingDirectoryFullPath,
                        downloadedReportZipFilePath,
                        undefined
                    );
                } else {
                    isExecutionSuccessfull = await tb2robotLib.startTb2robotWrite(
                        context,
                        workingDirectoryFullPath,
                        downloadedReportZipFilePath,
                        tb2robotConfigFilePath
                    );
                }

                if (
                    !(await handleExecutionError(
                        workingDirectoryFullPath,
                        isExecutionSuccessfull,
                        downloadedReportZipFilePath
                    ))
                ) {
                    return;
                }
                console.log(`Robot write executed.`);

                // Set the last generated report parameters so that the read command can fetch a new report with these parameters.
                lastGeneratedReportParams.UID = UIDofSelectedElement;
                lastGeneratedReportParams.projectKey = projectKey;
                lastGeneratedReportParams.cycleKey = cycleKey;
                lastGeneratedReportParams.executionBased = executionBased;

                // Delete created json config file after usage
                await deleteConfigurationFile(getConfigurationFilePath(workingDirectoryFullPath));

                if (config.get<boolean>("clearReportAfterProcessing")) {
                    // Remove the downloaded report zip file after usage
                    await removeReportZipFile(downloadedReportZipFilePath);
                }

                vscode.window.showInformationMessage(`Test generation done.`);
            } catch (error: any) {
                if (error instanceof vscode.CancellationError) {
                    console.log("Process cancelled by the user.");
                    vscode.window.showInformationMessage("Process cancelled by the user.");
                } else {
                    console.error("An error occurred:", error);
                    vscode.window.showErrorMessage(`An error occurred: ${error.message || error}`);
                }
                return; // Exit the progress function
            }
        }
    );
}

/**
 * Tries to find 'output.xml' recursively in the current workspace directory.
 * If not found, returns the location of the currently opened file.
 * @returns {Promise<string | undefined>} Full path of 'output.xml' or the currently opened file's location.
 */
export async function findOutputXml(): Promise<string | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage("No workspace folder is open.");
        return undefined;
    }

    const rootFolder = workspaceFolders[0].uri.fsPath;

    // Search recursively for 'output.xml'
    const outputFilePath = findFileRecursively(rootFolder, "output.xml");

    if (outputFilePath) {
        return outputFilePath;
    }

    // Fallback: return the path of the currently opened file if no 'output.xml' is found
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        return activeEditor.document.uri.fsPath;
    }

    vscode.window.showWarningMessage("No output.xml file found and no file is currently open.");
    return undefined;
}

/**
 * Removes the given zip file.
 * @param downloadedReportZipFilePath The path of the report zip file.
 */
export async function removeReportZipFile(downloadedReportZipFilePath: string): Promise<void> {
    try {
        // Check if the file exists
        if (!fs.existsSync(downloadedReportZipFilePath)) {
            throw new Error("File does not exist at the given path.");
        }

        // Extract the file name and extension from the path
        const fileName = path.basename(downloadedReportZipFilePath);
        const fileExtension = path.extname(downloadedReportZipFilePath);

        /*
        if (filePrefix)
            if (!fileName.startsWith(filePrefix)) {
                // Check if the file name starts with the prefix
                throw new Error("File name does not start with the required prefix.");
            }
        */
        
        // Check if the file is a zip file
        if (fileExtension !== ".zip") {
            throw new Error("File is not a zip file.");
        }

        // Delete the file
        await fs.promises.unlink(downloadedReportZipFilePath);
        console.log(`File ${fileName} successfully removed.`);
    } catch (error) {
        console.error(`Error removing the file: ${(error as Error).message}`);
    }
}

/**
 * Recursively searches for a file within a directory.
 * @param {string} dir - The directory to search in.
 * @param {string} fileName - The name of the file to search for.
 * @returns {string | undefined} The full path of the file if found, otherwise undefined.
 */
function findFileRecursively(dir: string, fileName: string): string | undefined {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Recursively search in subdirectories
            const result = findFileRecursively(fullPath, fileName);
            if (result) {
                return result;
            }
        } else if (stat.isFile() && file === fileName) {
            return fullPath;
        }
    }

    return undefined;
}

async function chooseRobotXMLFile(workingDirectoryFullPath: string): Promise<string | undefined> {
    // Open file selection dialog, filtered for XML files
    const selectedFiles = await vscode.window.showOpenDialog({
        defaultUri: vscode.Uri.file(workingDirectoryFullPath),
        canSelectFiles: true,
        canSelectMany: false,
        title: "Select Output XML File",
        openLabel: "Select Output XML File",
        filters: { "XML Files": ["xml"] },
    });

    // Return the selected file path if a file was chosen
    if (selectedFiles && selectedFiles.length > 0) {
        return selectedFiles[0].fsPath;
    }
    return undefined;
}

async function chooseReportWithouResultsZipFile(workingDirectoryFullPath: string): Promise<string | undefined> {
    // Open file selection dialog, filtered for XML files
    const selectedFiles = await vscode.window.showOpenDialog({
        defaultUri: vscode.Uri.file(workingDirectoryFullPath),
        title: "Select Report Zip File",
        openLabel: "Select Report Zip File",
        canSelectFiles: true,
        canSelectMany: false,
        filters: { "Zip Files": ["zip"] },
    });

    // Return the selected file path if a file was chosen
    if (selectedFiles && selectedFiles.length > 0) {
        return selectedFiles[0].fsPath;
    }
    return undefined;
}

export async function readTestResultsAndCreateReportWithResults(
    context: vscode.ExtensionContext,
    workingDirectory: string,
    reportWithResultsZip: string = `ReportWithResults_${new Date().getTime()}.zip` // Add a timestamp to the result file
) {
    const config = vscode.workspace.getConfiguration(baseKey);
    const workspacePath = config.get<string>("workspaceLocation");
    const workingDirectoryFullPath = path.join(workspacePath!, workingDirectory);

    // Select output XML file
    /*
    Use this code if you want to automate finding the output.xml
    let outputXMLPath = await findOutputXml();
    let robotResultXMLFile = outputXMLPath ? outputXMLPath : await chooseRobotXMLFile();
    */
    let robotResultXMLFile = await chooseRobotXMLFile(workingDirectoryFullPath);
    if (!robotResultXMLFile) {
        console.error(`No XML file selected.`);
        vscode.window.showErrorMessage(`No XML file selected.`);
        return;
    }

    const cycleStructureOptionsRequestParameter: types.OptionalJobIDRequestParameter = {
        basedOnExecution: lastGeneratedReportParams.executionBased,
        treeRootUID: lastGeneratedReportParams.UID,
    };

    if (
        !(
            lastGeneratedReportParams.executionBased !== undefined &&
            lastGeneratedReportParams.projectKey !== undefined &&
            lastGeneratedReportParams.cycleKey !== undefined &&
            lastGeneratedReportParams.UID !== undefined
        )
    ) {
        console.log(`Last generated report parameters are missing.`);
        return;
    }

    // Fetch the ZIP file from the server
    let downloadedReportZipFilePath = await fetchZipFile(
        baseKey,
        lastGeneratedReportParams.projectKey,
        lastGeneratedReportParams.cycleKey,
        workingDirectory,
        cycleStructureOptionsRequestParameter
    );

    let reportWithResultsZipFilePath =
        downloadedReportZipFilePath !== null
            ? downloadedReportZipFilePath
            : await chooseReportWithouResultsZipFile(workingDirectoryFullPath);
    if (!reportWithResultsZipFilePath) {
        console.error(`No report file selected.`);
        vscode.window.showErrorMessage(`No report file selected.`);
        return;
    }

    // Create configuration json object called testbench2robotframeworkConfig.json
    let isExecutionSuccessfull;
    const tb2robotConfigFilePath = await saveTestbench2RobotConfigurationAsJson(baseKey, workingDirectoryFullPath);
    if (!tb2robotConfigFilePath) {
        isExecutionSuccessfull = await tb2robotLib.startTb2robotRead(
            context,
            workingDirectoryFullPath,
            robotResultXMLFile,
            reportWithResultsZipFilePath,
            path.join(workingDirectoryFullPath, reportWithResultsZip)
        );
    } else {
        isExecutionSuccessfull = await tb2robotLib.startTb2robotRead(
            context,
            workingDirectoryFullPath,
            robotResultXMLFile,
            reportWithResultsZipFilePath,
            path.join(workingDirectoryFullPath, reportWithResultsZip),
            tb2robotConfigFilePath
        );
    }

    if (!(await handleExecutionError(workingDirectoryFullPath, isExecutionSuccessfull, reportWithResultsZipFilePath))) {
        return;
    }

    if (config.get<boolean>("clearReportAfterProcessing")) {
        await removeReportZipFile(reportWithResultsZipFilePath);
    }

    console.log(`tb2robot read executed.`);
    vscode.window.showInformationMessage(`Test results read and report created.`);
}

/**
 * Entry point for the robotframework test generation process from the TestBench JSON report.
 * @param treeItem The selected tree item
 * @param baseKey The base key of the extension
 * @param workingDirectory The path to save the downloaded report
 * @returns Promise<void>
 */
export async function startTestGenerationProcessForCycle(
    context: vscode.ExtensionContext,
    treeItem: ProjectManagementTreeItem,
    baseKey: string,
    workingDirectory: string,
    projectManagementTreeDataProvider: ProjectManagementTreeDataProvider
) {
    // Check if the cycle key is available
    const cycleKey = treeItem.item.key;
    if (cycleKey) {
        const projectKeyOfCycle = findProjectKeyOfCycleElement(treeItem);
        if (!projectKeyOfCycle) {
            return Promise.resolve([]);
        }

        if (projectKeyOfCycle) {
            // Check if the user is logged in
            if (connection) {
                // Start the generation process
                if (typeof treeItem.label === "string") {
                    generateTestsWithTestBenchToRobotFramework(
                        context,
                        treeItem,
                        treeItem.label,
                        baseKey,
                        projectKeyOfCycle,
                        cycleKey,
                        workingDirectory,
                        projectManagementTreeDataProvider,
                        undefined // UIDofTestThemeElementToGenerateTestsFor is undefined for a test cycle
                    );
                } else {
                    vscode.window.showErrorMessage("Invalid label type. Test generation aborted.");
                }
            } else {
                vscode.window.showErrorMessage("No connection available. Please log in first.");
            }
        } else {
            console.error("Project key of cycle is unidentified!");
            vscode.window.showErrorMessage("Project key of cycle is unidentified!");
            return;
        }
    } else {
        console.error("Cycle key is unidentified!");
        vscode.window.showErrorMessage("Cycle key is unidentified!");
        return;
    }
}

/**
 * Writes the testbench2robotframework configuration to a JSON file in workspace folder.
 * @param baseKey The base key of the extension
 */
export async function saveTestbench2RobotConfigurationAsJson(
    baseKey: string,
    pathToJsonConfig: string
): Promise<string | null> {
    try {
        const config = vscode.workspace.getConfiguration(baseKey);
        const generationConfig = config.get<types.Testbench2robotframeworkConfiguration>(
            "testbench2robotframeworkConfig"
        );
        if (!generationConfig) {
            return null;
        }

        const jsonContent = JSON.stringify(generationConfig, null, 2);
        const filePath = getConfigurationFilePath(pathToJsonConfig);

        // Write file, overwriting if it already exists
        fs.writeFile(filePath, jsonContent, "utf8", (err) => {
            if (err) {
                console.error(`Failed to write configuration file: ${err}`);
                return null;
            }
        });

        console.log(`Configuration file created or overwritten at: ${filePath}`);
        return filePath;
    } catch (error) {
        if (error instanceof Error) {
            vscode.window.showErrorMessage(`Failed to write configuration file: ${error.message}`);
        } else {
            vscode.window.showErrorMessage("An unknown error occurred while writing the configuration file.");
        }
        return null;
    }
}

/**
 * Determines the file path where the testbench2robotframework configuration file will be saved.
 * @returns The file path of the configuration file.
 */
function getConfigurationFilePath(pathToJsonConfig: string): string {
    const fileName = "testbench2robotframeworkConfig.json";
    const filePath = path.join(pathToJsonConfig, fileName);
    return filePath;
}

/**
 * Retrieves the path of the currently opened workspace folder.
 * @returns The path of the currently opened workspace folder.
 */
function getWorkspaceFolder(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders || workspaceFolders.length === 0) {
        throw new Error("No workspace folder is open. Please open a workspace to save the configuration file.");
    }

    // Handle multiple workspace folders differently
    return workspaceFolders[0].uri.fsPath;
}

/**
 * Deletes the testbench2robotframework configuration file from the workspace folder.
 */
export async function deleteConfigurationFile(configFilePath: string): Promise<void> {
    try {
        fs.unlink(configFilePath, (err) => {
            if (err) {
                throw err;
            }
        });
        console.log(`Configuration file deleted from: ${configFilePath}`);
    } catch (error: any) {
        if (error.code === "ENOENT") {
            vscode.window.showErrorMessage(`Configuration file not found: ${error.path}`);
        } else {
            vscode.window.showErrorMessage(`Failed to delete configuration file: ${error.message}`);
            console.error(error);
        }
    }
}

// TEST CODE FOR AUTOMATING THE WHOLE PROCESS

/**
 * Executes the 'tb2robot write' command in the VS Code terminal with the provided report zip file name.
 * @param cycleReportZipFileName - The name of the zip file to be processed by 'tb2robot write' command.
 */
export async function executeTb2RobotWriteCommand(
    terminal: vscode.Terminal,
    cycleReportZipFileName: string,
    terminalCodeExecutionPath?: string // Optinal configuration file path for the command
): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            // Validate the input to ensure it's a non-empty string
            if (!cycleReportZipFileName || typeof cycleReportZipFileName !== "string") {
                throw new Error("Invalid zip file name provided.");
            }

            // Ensure the file has a .zip extension
            if (!cycleReportZipFileName.endsWith(".zip")) {
                throw new Error("The provided file is not a .zip file.");
            }

            // Create or get an existing terminal named 'tb2robot'
            // const terminal = getOrCreateTerminal("tb2robot");

            // Execute the command in the terminal
            terminal.show(true); // Show the terminal and focus on it
            if (terminalCodeExecutionPath) {
                terminal.sendText(`tb2robot write -c ${terminalCodeExecutionPath} ${cycleReportZipFileName}`);
            } else {
                terminal.sendText(`tb2robot write ${cycleReportZipFileName}`);
            }

            // Optional: Inform the user the command was executed
            console.log(`Executing: tb2robot write ${cycleReportZipFileName}`);
        } catch (error) {
            console.error("Failed to execute command tb2robot write:", error);
            // Display any errors encountered during execution
            vscode.window.showErrorMessage(`Failed to execute command tb2robot write: ${error}`);
        } finally {
            resolve(); // Resolve promise when terminal execution is complete
        }
    });
}

/**
 * Retrieves an existing terminal or creates a new one if it doesn't exist.
 * @param terminalName - The name of the terminal.
 * @returns The VS Code Terminal instance.
 */
function getOrCreateTerminal(terminalName: string): vscode.Terminal {
    // Find an existing terminal with the specified name
    const existingTerminal = vscode.window.terminals.find((t) => t.name === terminalName);

    // If terminal exists, return it; otherwise, create a new one
    return existingTerminal ?? vscode.window.createTerminal(terminalName);
}

/**
 * Executes the 'robot -d output --dryrun Generated' command in the VS Code terminal.
 * @param outputDirOfRobotframeworkResults - The directory for Robot Framework output.
 * @param pathOfRobotFrameworkTests - The name of the file or directory to dry run.
 */
export async function executeRobotDryRunCommand(
    terminal: vscode.Terminal,
    outputDirOfRobotframeworkResults: string,
    pathOfRobotFrameworkTests: string
): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            // Validate input parameters to ensure they are non-empty strings
            if (!outputDirOfRobotframeworkResults || typeof outputDirOfRobotframeworkResults !== "string") {
                throw new Error("Invalid output directory provided.");
            }
            if (!pathOfRobotFrameworkTests || typeof pathOfRobotFrameworkTests !== "string") {
                throw new Error("Invalid generated file or directory provided.");
            }

            // Create or get an existing terminal named 'robot-dryrun'
            // const terminal = getOrCreateTerminal("robot-dryrun");

            // Execute the command in the terminal
            const command = `robot -d ${outputDirOfRobotframeworkResults} --dryrun ${pathOfRobotFrameworkTests}`;
            terminal.show(true); // Show the terminal and focus on it
            terminal.sendText(command);

            // Inform the user the command was executed
            console.log(`Executing command: ${command}`);
        } catch (error) {
            console.error("Failed to execute command robot --dryrun:", error);
            // Display any errors encountered during execution
            vscode.window.showErrorMessage(`Failed to execute command robot --dryrun:: ${error}`);
        } finally {
            resolve(); // Resolve promise when terminal execution is complete
        }
    });
}

/**
 * Executes the 'tb2robot read' command in the VS Code terminal with specified parameters.
 * @param reportWithoutResultsZip - The name of the cycle zip file to be read by 'tb2robot'.
 * @param robotframeworkResultXML - The output file path (default is 'output/output.xml').
 * @param reportWithResultsZip - The report file to be generated (default is 'ReportWithResults.zip').
 */
export async function executeTb2RobotReadCommand(
    terminal: vscode.Terminal,
    robotframeworkResultXML: string = "output/output.xml",
    reportWithResultsZip: string = "ReportWithResults.zip",
    reportWithoutResultsZip: string
): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            // Validate input parameters to ensure they are non-empty strings
            if (!reportWithoutResultsZip || typeof reportWithoutResultsZip !== "string") {
                throw new Error("Invalid cycle zip file provided.");
            }
            if (!robotframeworkResultXML || typeof robotframeworkResultXML !== "string") {
                throw new Error("Invalid output file path provided.");
            }
            if (!reportWithResultsZip || typeof reportWithResultsZip !== "string") {
                throw new Error("Invalid report zip file provided.");
            }

            // Construct the command with specified parameters
            const command = `tb2robot read -o ${robotframeworkResultXML} -r ${reportWithResultsZip} ${reportWithoutResultsZip}`;
            terminal.show(true); // Show and focus the terminal
            terminal.sendText(command);

            // Inform the user that the command was executed
            console.log(`Executing command: ${command}`);
        } catch (error) {
            console.error("Failed to execute command tb2robot read:", error);
            // Display any errors encountered during execution
            vscode.window.showErrorMessage(`Failed to execute command tb2robot read: ${error}`);
        } finally {
            resolve(); // Resolve promise when terminal execution is complete
        }
    });
}

/**
 * Executes the three required commands in sequence in the same terminal.
 * @param reportWithoutResultsZipFilePath - The name of the cycle zip file to be processed.
 * @param outputDirOfRobotframeworkResults - The directory for Robot Framework output.
 * @param pathOfRobotFrameworkTests - The file or directory to dry run.
 * @param robotResultXMLFile - The output file path (default is 'output/output.xml').
 * @param reportWithResultsZipFilePath - The report file to be generated (default is 'ReportWithResults.zip').
 */
export async function generateTestsExecuteTestsReadResults(
    terminalCodeExecutionPath: string,
    outputDirOfRobotframeworkResults: string = "output",
    pathOfRobotFrameworkTests: string = "Generated"
): Promise<void> {
    return new Promise(async (resolve, reject) => {
        const terminal = getOrCreateTerminal("generate-tests");
        terminal.sendText(`cd ${terminalCodeExecutionPath}`); // Execute terminal commands inside this directory

        try {
            // Step 2: Execute 'robot -d output --dryrun Generated'
            await executeRobotDryRunCommand(terminal, outputDirOfRobotframeworkResults, pathOfRobotFrameworkTests);
            console.log(
                `Successfully executed: robot -d ${outputDirOfRobotframeworkResults} --dryrun ${pathOfRobotFrameworkTests}`
            );
        } catch (error) {
            console.error(`Error executing commands in sequence: ${error}`);
            vscode.window.showErrorMessage(`Error executing commands in sequence: ${error}`);
        } finally {
            resolve(); // Resolve promise when terminal execution is complete
        }
    });
}
