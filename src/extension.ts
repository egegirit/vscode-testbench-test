import * as vscode from "vscode";
import * as reportHandler from "./reportHandler";
import * as testbenchConnection from "./testBenchConnection";
import * as projectManagementTreeView from "./projectManagementTreeView";
import path from "path";

// TODO: WebViev UI for login?
// TODO: Create extension documentation in Readme.md
// TODO: To be able to select the report.zip in .testbench automatically, or fetch it from server automatically, store the UID of the fetched report and project key.

// Prefix of the commands in package.json
export const baseKey = "testbenchExtension";

// TODO: Make the connection and projectManagementTreeDataProvider project wide variables
export let projectManagementTreeDataProvider: projectManagementTreeView.ProjectManagementTreeDataProvider | null = null; // Store the tree data provider
export let connection: testbenchConnection.PlayServerConnection | null = null; // Store the connection to server

export function setConnection(newConnection: testbenchConnection.PlayServerConnection) {
    connection = newConnection;
}

// Folder to create under the working directory to download / process files
export const folderNameOfTestbenchWorkingDirectory = ".testbench";

interface LastGeneratedReportParams {
    executionBased: boolean | undefined;
    projectKey: string | undefined;
    cycleKey: string | undefined;
    UID: string | undefined;
}
export let lastGeneratedReportParams: LastGeneratedReportParams = {
    executionBased: undefined,
    projectKey: undefined,
    cycleKey: undefined,
    UID: undefined,
};

export function activate(context: vscode.ExtensionContext) {
    // Store extension commands with their titles to be able to display them together in a quickpick
    const commands = {
        displayCommands: {
            command: `${baseKey}.displayCommands`,
            title: "Display Available Commands",
        },
        login: {
            command: `${baseKey}.login`,
            title: "Login to TestBench Server",
        },
        changeConnection: {
            command: `${baseKey}.changeConnection`,
            title: "Change account",
        },
        logout: {
            command: `${baseKey}.logout`,
            title: "Logout from TestBench Server",
        },
        generateTestCasesForCycle: {
            command: `${baseKey}.generateTestCasesForCycle`,
            title: "Generate Tests",
        },
        generateTestCasesForTestThemeOrTestCaseSet: {
            command: `${baseKey}.generateTestCasesForTestThemeOrTestCaseSet`,
            title: "Generate Tests",
        },
        readRFTestResultsAndCreateReportWithResults: {
            command: `${baseKey}.readRFTestResultsAndCreateReportWithResults`,
            title: "Read Test Results & Create Report With Results",
        },
        makeRoot: {
            command: `${baseKey}.makeRoot`,
            title: "Make Root Item",
        },
        getCycleStructure: {
            command: `${baseKey}.getCycleStructure`,
            title: "Get Cycle Structure",
        },
        getServerVersions: {
            command: `${baseKey}.getServerVersions`,
            title: "Get Server Versions",
        },
        showExtensionSettings: {
            command: `${baseKey}.showExtensionSettings`,
            title: "Show Extension Settings",
        },
        fetchReportForSelectedTreeItem: {
            command: `${baseKey}.fetchReportForSelectedTreeItem`,
            title: "Fetch Report",
        },
        selectAndLoadProject: {
            command: `${baseKey}.selectAndLoadProject`,
            title: "Display Projects List",
        },
        uploadTestResultsToTestbench: {
            command: `${baseKey}.uploadTestResultsToTestbench`,
            title: "Upload Test Results To Testbench",
        },
        executeRobotFrameworkTests: {
            command: `${baseKey}.executeRobotFrameworkTests`,
            title: "Execute Tests",
        },
        refreshProjectTreeView: {
            command: `${baseKey}.refreshProjectTreeView`,
            title: "Refresh Project Tree View",
        },
        refreshTestTreeView: {
            command: `${baseKey}.refreshTestTreeView`,
            title: "Refresh Test Tree View",
        },
        setWorkspaceLocation: {
            command: `${baseKey}.setWorkspaceLocation`,
            title: "Set Workspace Location",
        },
    };

    // Extension configuration settings
    let storePassword: boolean;
    let workspaceLocation: string | undefined;

    // Initialize or update configuration settings
    async function loadConfiguration() {
        const config = vscode.workspace.getConfiguration(baseKey);

        storePassword = config.get<boolean>("storePasswordAfterLogin", false);
        // If storePassword is false, delete the stored password.
        // The password is only stored after a successful login.
        if (!storePassword) {
            testbenchConnection.clearStoredCredentials(context);
        }

        // If the user wont specify a workspace location, use the workspace location of VS Code
        if (!config.get<string>("workspaceLocation")) {
            await config.update("workspaceLocation", vscode.workspace.workspaceFolders?.[0]?.uri.fsPath);
        }
    }

    // Load initial configuration
    loadConfiguration();

    // Respond to configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(baseKey)) {
                loadConfiguration();
                console.log("Configuration changed!");
            }
        })
    );

    async function promptForWorkspaceLocation(): Promise<string | undefined> {
        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: "Select Workspace Location",
            canSelectFolders: true,
            canSelectFiles: false,
        };

        const folderUri = await vscode.window.showOpenDialog(options);
        if (folderUri && folderUri[0]) {
            return folderUri[0].fsPath;
        }
        return undefined;
    }

    // Register the "Set Workspace Location" command
    context.subscriptions.push(
        vscode.commands.registerCommand(`${baseKey}.setWorkspaceLocation`, async () => {
            const newWorkspaceLocation = await promptForWorkspaceLocation();
            if (newWorkspaceLocation) {
                workspaceLocation = newWorkspaceLocation;
                const config = vscode.workspace.getConfiguration(baseKey);
                await config.update("workspaceLocation", workspaceLocation);
                vscode.window.showInformationMessage(`Workspace location set to: ${workspaceLocation}`);
            }
        })
    );

    // Register "Show Extension Settings" command
    context.subscriptions.push(
        vscode.commands.registerCommand(commands.showExtensionSettings.command, () => {
            // Open the settings UI of the extension inside the settings editor
            vscode.commands
                .executeCommand("workbench.action.openSettings2", {
                    query: "@ext:imbus.testbench-visual-studio-code-extension",
                })
                .then(() => {
                    // Open the workspace settings view (The default settings view is user settings)
                    vscode.commands.executeCommand("workbench.action.openWorkspaceSettings");
                });
        })
    );
    vscode.commands.executeCommand("setContext", "testbenchExtension.connectionActive", connection !== null); // Login/Logout icon changes based on connection status

    // Register the "Display Commands" command
    context.subscriptions.push(
        vscode.commands.registerCommand(commands.displayCommands.command, async () => {
            // Display the commands based on the connection status. (Logout etc. is only available if connection is active)
            let commandMenuOptions = [];
            if (connection) {
                commandMenuOptions = [
                    commands.logout.title,
                    commands.changeConnection.title,
                    commands.showExtensionSettings.title,
                    commands.selectAndLoadProject.title,
                    commands.readRFTestResultsAndCreateReportWithResults.title,
                    commands.uploadTestResultsToTestbench.title,
                    "Cancel",
                ];
            } else {
                commandMenuOptions = [commands.login.title, commands.showExtensionSettings.title, "Cancel"];
            }

            const nextAction = await vscode.window.showQuickPick(commandMenuOptions, {
                placeHolder: "What do you want to do?",
            });

            switch (nextAction) {
                case commands.login.title:
                    vscode.commands.executeCommand(commands.login.command);
                    break;
                case commands.logout.title:
                    vscode.commands.executeCommand(commands.logout.command);
                    break;
                case commands.showExtensionSettings.title:
                    vscode.commands.executeCommand(commands.showExtensionSettings.command);
                    break;
                case commands.selectAndLoadProject.title:
                    vscode.commands.executeCommand(commands.selectAndLoadProject.command);
                    break;
                case commands.readRFTestResultsAndCreateReportWithResults.title:
                    vscode.commands.executeCommand(commands.readRFTestResultsAndCreateReportWithResults.command);
                    break;
                case commands.uploadTestResultsToTestbench.title:
                    vscode.commands.executeCommand(commands.uploadTestResultsToTestbench.command);
                    break;
                case commands.changeConnection.title:
                    vscode.commands.executeCommand(commands.changeConnection.command);
                    break;
                case "Cancel":
                    return;
            }
        })
    );

    // The user may press the login button multiple times consecutively. Aviod executing the command again if already inside login.
    let insideLogin = false;
    // Register the "Login" command
    context.subscriptions.push(
        vscode.commands.registerCommand(commands.login.command, async () => {
            if (insideLogin) {
                console.log("Already inside login..");
                return;
            }
            insideLogin = true;

            // Only execute the finally block after the login attempt is fully completed to avoid multiple login prompts after clicking login multiple times.
            testbenchConnection
                .performLogin(context, baseKey)
                .then((connectionAfterLogin: any) => {
                    if (!connectionAfterLogin) {
                        return;
                    } else {
                        connection = connectionAfterLogin;
                    }
                })
                .catch((error: any) => {
                    console.error("Login process failed:", error);
                })
                .finally(() => {
                    // Reset insideLogin after the login attempt is fully completed
                    insideLogin = false;
                });
        })
    );

    // Register the "Logout" command
    context.subscriptions.push(
        vscode.commands.registerCommand(commands.logout.command, async () => {
            if (connection) {
                await connection.logoutUser(context, projectManagementTreeDataProvider!);
                connection = null; // Clear the connection
                projectManagementTreeDataProvider = null; // Clear the tree data provider
            } else {
                vscode.window.showWarningMessage("No connection available. Please log in first.");
            }
        })
    );

    // Register the "Change Connection" command
    context.subscriptions.push(
        vscode.commands.registerCommand(commands.changeConnection.command, async () => {
            let { newTreeDataProvider } = await testbenchConnection.changeConnection(
                context,
                baseKey,
                projectManagementTreeDataProvider!
            );
            if (connection) {
                projectManagementTreeDataProvider = newTreeDataProvider; // Update the tree data provider
            } else {
                vscode.window.showWarningMessage("Error when changing connection.");
            }
        })
    );

    // Register the "Generate Tests" command, which is activated for a cycle element
    context.subscriptions.push(
        vscode.commands.registerCommand(
            commands.generateTestCasesForCycle.command,
            async (item: projectManagementTreeView.ProjectManagementTreeItem) => {
                if (connection) {
                    // Clear the test theme tree when a cycle is expanded so that clicking on a new test cycle will not show the old test themes
                    // projectManagementTreeDataProvider?.testThemeDataProvider.clearTree();

                    // If the user did not expanded a test cycle, test cycle wont have any children so that test themes cannot be displayed in the quickpick.
                    // Call getChildrenOfCycle initialize the sub elements of the cycle.
                    // Offload the children of the cycle to the Test Theme Tree
                    if (projectManagementTreeDataProvider?.testThemeDataProvider) {
                        const children = (await projectManagementTreeDataProvider.getChildrenOfCycle(item)) ?? [];
                        projectManagementTreeDataProvider.testThemeDataProvider.setRoots(children);
                    }

                    if (projectManagementTreeDataProvider) {
                        await reportHandler.startTestGenerationProcessForCycle(
                            context,
                            item,
                            baseKey,
                            folderNameOfTestbenchWorkingDirectory
                        );
                    } else {
                        vscode.window.showErrorMessage(
                            "Project management tree is not initialized. Please select a project first."
                        );
                    }
                } else {
                    vscode.window.showErrorMessage("No connection available. Please log in first.");
                }
            }
        )
    );

    // Register the "Fetch Report" command for a tree element
    context.subscriptions.push(
        vscode.commands.registerCommand(
            commands.fetchReportForSelectedTreeItem.command,
            async (treeItem: projectManagementTreeView.ProjectManagementTreeItem) => {
                reportHandler.callFetchReportForTreeElement(
                    treeItem,
                    projectManagementTreeDataProvider,
                    folderNameOfTestbenchWorkingDirectory
                );
            }
        )
    );

    // Register the "Generate Tests For Test Theme or Test Case Set" command, which is activated for a test theme element
    context.subscriptions.push(
        vscode.commands.registerCommand(
            commands.generateTestCasesForTestThemeOrTestCaseSet.command,
            async (treeItem: projectManagementTreeView.ProjectManagementTreeItem) => {
                if (connection) {
                    console.log("Generating tests for:", treeItem);

                    let treeElementUniqueID = treeItem.item?.base?.uniqueID;
                    let cycleKey = projectManagementTreeView.findCycleKeyOfTreeElement(treeItem);
                    let projectKey = projectManagementTreeView.findProjectKeyOfCycleElement(treeItem.parent!);

                    if (!projectKey || !cycleKey || !treeElementUniqueID) {
                        console.error("Error when finding project key, cycle key, test theme or unique ID.");
                        return;
                    }

                    reportHandler.generateTestsWithTestBenchToRobotFramework(
                        context,
                        treeItem,
                        typeof treeItem.label === "string" ? treeItem.label : "", // Label might be undefined
                        baseKey,
                        projectKey,
                        cycleKey,
                        folderNameOfTestbenchWorkingDirectory,
                        treeElementUniqueID
                    );
                } else {
                    vscode.window.showErrorMessage("No connection available. Please log in first.");
                }
            }
        )
    );

    // Register the "Execute Tests" command
    context.subscriptions.push(
        vscode.commands.registerCommand(commands.executeRobotFrameworkTests.command, async () => {
            const config = vscode.workspace.getConfiguration(baseKey);
            reportHandler.generateTestsExecuteTestsReadResults(
                path.join(config.get<string>("workspaceLocation")!, folderNameOfTestbenchWorkingDirectory)
            );
        })
    );

    // Register the "Read Test Results" command, which is activated for a test theme or test case set element
    context.subscriptions.push(
        vscode.commands.registerCommand(commands.readRFTestResultsAndCreateReportWithResults.command, async () => {
            if (connection) {
                reportHandler.readTestResultsAndCreateReportWithResults(context, folderNameOfTestbenchWorkingDirectory);
            } else {
                vscode.window.showErrorMessage("No connection available. Please log in first.");
            }
        })
    );

    // Register the "Make Root" command
    context.subscriptions.push(
        vscode.commands.registerCommand(
            commands.makeRoot.command,
            (treeItem: projectManagementTreeView.ProjectManagementTreeItem) => {
                if (projectManagementTreeDataProvider) {
                    // Find out for which element the make root command is called
                    if (
                        treeItem.contextValue === "Project" ||
                        treeItem.contextValue === "Version" ||
                        treeItem.contextValue === "Cycle"
                    ) {
                        // If we are in the project management tree, call the makeRoot method of the project management tree data provider
                        projectManagementTreeDataProvider.makeRoot(treeItem);
                    } else {
                        // If we are in the test theme tree, call the makeRoot method of the test theme tree data provider
                        projectManagementTreeDataProvider.testThemeDataProvider.makeRoot(treeItem);
                    }
                }
            }
        )
    );

    // Register the "Refresh Project Tree" command
    context.subscriptions.push(
        vscode.commands.registerCommand(commands.refreshProjectTreeView.command, async () => {
            projectManagementTreeDataProvider?.clearTree();
            [projectManagementTreeDataProvider] = await projectManagementTreeView.initializeTreeView(
                context,
                connection!,
                projectManagementTreeDataProvider?.currentProjectKeyInView!
            );
        })
    );

    // Register the "Refresh Test Tree" command
    context.subscriptions.push(
        vscode.commands.registerCommand(commands.refreshTestTreeView.command, async () => {
            projectManagementTreeDataProvider?.testThemeDataProvider.refresh();

            let cycleElement = projectManagementTreeDataProvider?.testThemeDataProvider?.rootElements[0]?.parent!;
            if (cycleElement && cycleElement.contextValue === "Cycle") {
                // Clear the test theme tree when a cycle is expanded so that clicking on a new test cycle will not show the old test themes
                projectManagementTreeDataProvider?.testThemeDataProvider?.clearTree();
                // Fetch the test themes from the server
                const children = (await projectManagementTreeDataProvider?.getChildrenOfCycle(cycleElement)) ?? [];
                projectManagementTreeDataProvider?.testThemeDataProvider?.setRoots(children);
            }
        })
    );

    // Register the "Select And Load Project" command
    context.subscriptions.push(
        vscode.commands.registerCommand(commands.selectAndLoadProject.command, async () => {
            if (connection) {
                const projectList = await connection.getProjectsList();

                if (!projectList) {
                    // vscode.window.showErrorMessage("No projects found..");
                    return;
                }

                const selectedProjectKey = await connection.selectProjectKeyFromProjectList(projectList);

                if (!selectedProjectKey) {
                    // vscode.window.showErrorMessage("No project selected..");
                    return;
                }

                projectManagementTreeDataProvider = new projectManagementTreeView.ProjectManagementTreeDataProvider(
                    connection,
                    selectedProjectKey!
                );
                vscode.window.createTreeView("projectManagementTree", {
                    treeDataProvider: projectManagementTreeDataProvider,
                });
                [projectManagementTreeDataProvider] = await projectManagementTreeView.initializeTreeView(
                    context,
                    connection,
                    selectedProjectKey!
                );
            } else {
                vscode.window.showErrorMessage("No connection available. Please log in first.");
            }
        })
    );

    // Register the Upload Test Results to TestBench command
    context.subscriptions.push(
        vscode.commands.registerCommand(commands.uploadTestResultsToTestbench.command, async () => {
            if (!connection) {
                vscode.window.showErrorMessage("No connection available. Please log in first.");
                return;
            }

            if (!projectManagementTreeDataProvider || !projectManagementTreeDataProvider.currentProjectKeyInView) {
                vscode.window.showErrorMessage("No project selected. Please select a project first.");
                return;
            }

            testbenchConnection.selectReportWithResultsAndImportToTestbench(
                connection,
                projectManagementTreeDataProvider
            );
        })
    );

    // Uncomment this if you want to prompt the user to log in when the extension activates
    // vscode.commands.executeCommand(`${baseKey}.login`);
}

export function deactivate() {}
