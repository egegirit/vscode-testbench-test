*** Settings ***
Resource    ../../../../Resources/functional_keywords.resource
Metadata    UniqueID    itb-TC-19621
Metadata    Name    Nur Fahrzeugpreise
Metadata    Numbering    1.2.3.2.1
Test Tags    Demo    Systemtest    Automatisiert


*** Test Cases ***
itb-TC-19621-PC-119695
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

itb-TC-19621-PC-119694
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

itb-TC-19621-PC-119693
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

itb-TC-19621-PC-119692
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

itb-TC-19621-PC-119893
    [Tags]    Demo    Systemtest    Testumgebung:HIL 1
    # CarConfig starten
        functional_keywords.Open CarConfig
        functional_keywords.Set Username    schulung20
        functional_keywords.Set Password    @RBTFRMWRK@
        functional_keywords.Click Login Btn
    # Neues Fahrzeug erstellen
        functional_keywords.Click New_Car
    # Fahrzeug wählen    Fahrzeug=I5
        functional_keywords.Select Base Model    I5
    # Endpreis prüfen    Endpreis=29,000.00
        functional_keywords.Verify Total Price    29,000.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig
