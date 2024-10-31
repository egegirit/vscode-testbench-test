*** Settings ***
Resource    ../../../Resources/functional_keywords.resource
Metadata    UniqueID    iTB-TC-319
Metadata    Name    Sondermodellpreis
Metadata    Numbering    1.2.4.3
Test Tags    Demo    Systemtest    Automatisiert


*** Test Cases ***
iTB-TC-319-PC-1619
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
    # Endpreis prüfen    Endpreis=16,413.00
        functional_keywords.Verify Total Price    16,413.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-319-PC-1620
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
    # Endpreis prüfen    Endpreis=16,049.00
        functional_keywords.Verify Total Price    16,049.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-319-PC-1621
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
    # Endpreis prüfen    Endpreis=17,499.99
        functional_keywords.Verify Total Price    17,499.99    €
    # CarConfig beenden
        functional_keywords.Close CarConfig
