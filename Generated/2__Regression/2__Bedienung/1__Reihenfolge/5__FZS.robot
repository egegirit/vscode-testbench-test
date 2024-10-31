*** Settings ***
Resource    ../../../../Resources/functional_keywords.resource
Metadata    UniqueID    iTB-TC-326
Metadata    Name    FZS
Metadata    Numbering    1.2.2.1.5
Test Tags    Demo    Systemtest    Automatisiert


*** Test Cases ***
iTB-TC-326-PC-1648
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
    # Zubehör wählen    Zubehör(Liste)=Sportfelgen
        functional_keywords.Select Accessory    Sportfelgen
    # Zubehör wählen    Zubehör(Liste)=ABS
        functional_keywords.Select Accessory    ABS
    # Sondermodell wählen    Sondermodell=Jazz
        functional_keywords.Select Special Model    Jazz
    # Endpreis prüfen    Endpreis=17,039.00
        functional_keywords.Verify Total Price    17,039.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig
