*** Settings ***
Resource    ../../../../Resources/functional_keywords.resource
Metadata    UniqueID    itb-TC-19616
Metadata    Name    Sondermodell wählen
Metadata    Numbering    1.2.2.2.2
Test Tags    Demo    Systemtest    Automatisiert


*** Test Cases ***
itb-TC-19616-PC-119480
    [Tags]    Demo    Systemtest    Testumgebung:HIL 1
    # CarConfig starten
        functional_keywords.Open CarConfig
        functional_keywords.Set Username    schulung20
        functional_keywords.Set Password    @RBTFRMWRK@
        functional_keywords.Click Login Btn
    # Neues Fahrzeug erstellen
        functional_keywords.Click New_Car
    # Fahrzeug wählen    Fahrzeug=Minigolf
        functional_keywords.Select Base Model    Minigolf
    # Sondermodell wählen    Sondermodell=Gomera
        functional_keywords.Select Special Model    Gomera
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19616-PC-119546
    [Tags]    Demo    Systemtest    Testumgebung:HIL 1
    # CarConfig starten
        functional_keywords.Open CarConfig
        functional_keywords.Set Username    schulung20
        functional_keywords.Set Password    @RBTFRMWRK@
        functional_keywords.Click Login Btn
    # Neues Fahrzeug erstellen
        functional_keywords.Click New_Car
    # Fahrzeug wählen    Fahrzeug=Minigolf
        functional_keywords.Select Base Model    Minigolf
    # Sondermodell wählen    Sondermodell=Jazz
        functional_keywords.Select Special Model    Jazz
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19616-PC-119557
    [Tags]    Demo    Systemtest    Testumgebung:HIL 1
    # CarConfig starten
        functional_keywords.Open CarConfig
        functional_keywords.Set Username    schulung20
        functional_keywords.Set Password    @RBTFRMWRK@
        functional_keywords.Click Login Btn
    # Neues Fahrzeug erstellen
        functional_keywords.Click New_Car
    # Fahrzeug wählen    Fahrzeug=Minigolf
        functional_keywords.Select Base Model    Minigolf
    # Sondermodell wählen    Sondermodell=Luxus
        functional_keywords.Select Special Model    Luxus
    # CarConfig beenden
        functional_keywords.Close CarConfig
