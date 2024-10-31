*** Settings ***
Resource    ../../../../Resources/functional_keywords.resource
Metadata    UniqueID    iTB-TC-325
Metadata    Name    FSZ
Metadata    Numbering    1.2.2.1.1
Test Tags    Demo    Systemtest    Automatisiert


*** Test Cases ***
iTB-TC-325-PC-1647
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
    # Zubehör wählen    Zubehör(Liste)=0,00
        functional_keywords.Select Accessory    0,00
    # Endpreis prüfen    Endpreis=Sportfelgen
        functional_keywords.Verify Total Price    Sportfelgen    €
    # Endpreis prüfen    Endpreis=ABS
        functional_keywords.Verify Total Price    ABS    €
    # CarConfig beenden
        functional_keywords.Close CarConfig
