*** Settings ***
Resource    ../../../Resources/functional_keywords.resource
Metadata    UniqueID    iTB-TC-318
Metadata    Name    Fahrzeugpreis
Metadata    Numbering    1.2.4.1
Test Tags    Demo    Systemtest    Automatisiert


*** Test Cases ***
iTB-TC-318-PC-1613
    [Tags]    Demo    Systemtest    Testumgebung:HIL 1
    # CarConfig starten
        functional_keywords.Open CarConfig
        functional_keywords.Set Username    schulung20
        functional_keywords.Set Password    @RBTFRMWRK@
        functional_keywords.Click Login Btn
    # Neues Fahrzeug erstellen
        functional_keywords.Click New_Car
    # Fahrzeug wählen    Fahrzeug=Rolo
        functional_keywords.Select Base Model    Rolo
    # Endpreis prüfen    Endpreis=12,300.00
        functional_keywords.Verify Total Price    12,300.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-318-PC-1614
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
    # Endpreis prüfen    Endpreis=15,000.00
        functional_keywords.Verify Total Price    15,000.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-318-PC-1615
    [Tags]    Demo    Systemtest    Testumgebung:HIL 1
    # CarConfig starten
        functional_keywords.Open CarConfig
        functional_keywords.Set Username    schulung20
        functional_keywords.Set Password    @RBTFRMWRK@
        functional_keywords.Click Login Btn
    # Neues Fahrzeug erstellen
        functional_keywords.Click New_Car
    # Fahrzeug wählen    Fahrzeug=Rassant
        functional_keywords.Select Base Model    Rassant
    # Endpreis prüfen    Endpreis=17,000.00
        functional_keywords.Verify Total Price    17,000.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-318-PC-1616
    [Tags]    Demo    Systemtest    Testumgebung:HIL 1
    # CarConfig starten
        functional_keywords.Open CarConfig
        functional_keywords.Set Username    schulung20
        functional_keywords.Set Password    @RBTFRMWRK@
        functional_keywords.Click Login Btn
    # Neues Fahrzeug erstellen
        functional_keywords.Click New_Car
    # Fahrzeug wählen    Fahrzeug=Rassant Family
        functional_keywords.Select Base Model    Rassant Family
    # Endpreis prüfen    Endpreis=18,500.00
        functional_keywords.Verify Total Price    18,500.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig
