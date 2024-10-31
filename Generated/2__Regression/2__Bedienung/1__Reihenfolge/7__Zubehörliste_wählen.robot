*** Settings ***
Resource    ../../../../Resources/functional_keywords.resource
Metadata    UniqueID    itb-TC-19617
Metadata    Name    Zubehörliste wählen
Metadata    Numbering    1.2.2.1.7
Test Tags    Demo    Systemtest    Automatisiert


*** Test Cases ***
itb-TC-19617-PC-119491
    [Tags]    Demo    Systemtest    Testumgebung:HIL 1
    # CarConfig starten
        functional_keywords.Open CarConfig
        functional_keywords.Set Username    schulung20
        functional_keywords.Set Password    @RBTFRMWRK@
        functional_keywords.Click Login Btn
    # Neues Fahrzeug erstellen
        functional_keywords.Click New_Car
    # Zubehör wählen    Zubehör(Liste)=Lederlenkrad
        functional_keywords.Select Accessory    Lederlenkrad
    # Zubehör wählen    Zubehör(Liste)=Beheizbarer Außenspiegel
        functional_keywords.Select Accessory    Beheizbarer Außenspiegel
    # Zubehör wählen    Zubehör(Liste)=Zentralverriegelung
        functional_keywords.Select Accessory    Zentralverriegelung
    # Zubehör wählen    Zubehör(Liste)=Sportfelgen
        functional_keywords.Select Accessory    Sportfelgen
    # Zubehör wählen    Zubehör(Liste)=ABS
        functional_keywords.Select Accessory    ABS
    # Zubehör wählen    Zubehör(Liste)=Fensterheber hinten
        functional_keywords.Select Accessory    Fensterheber hinten
    # Zubehör wählen    Zubehör(Liste)=Radio mit CD-Wechsler
        functional_keywords.Select Accessory    Radio mit CD-Wechsler
    # Zubehör wählen    Zubehör(Liste)=Fußmatten
        functional_keywords.Select Accessory    Fußmatten
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19617-PC-188585
    [Tags]    Demo    Systemtest    Testumgebung:HIL 1
    # CarConfig starten
        functional_keywords.Open CarConfig
        functional_keywords.Set Username    schulung20
        functional_keywords.Set Password    @RBTFRMWRK@
        functional_keywords.Click Login Btn
    # Neues Fahrzeug erstellen
        functional_keywords.Click New_Car
    # Zubehör wählen    Zubehör(Liste)=Sportfelgen
        functional_keywords.Select Accessory    Sportfelgen
    # Zubehör wählen    Zubehör(Liste)=ABS
        functional_keywords.Select Accessory    ABS
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19617-PC-188587
    [Tags]    Demo    Systemtest    Testumgebung:HIL 1
    # CarConfig starten
        functional_keywords.Open CarConfig
        functional_keywords.Set Username    schulung20
        functional_keywords.Set Password    @RBTFRMWRK@
        functional_keywords.Click Login Btn
    # Neues Fahrzeug erstellen
        functional_keywords.Click New_Car
    # Zubehör wählen    Zubehör(Liste)=Lederlenkrad
        functional_keywords.Select Accessory    Lederlenkrad
    # Zubehör wählen    Zubehör(Liste)=Beheizbarer Außenspiegel
        functional_keywords.Select Accessory    Beheizbarer Außenspiegel
    # Zubehör wählen    Zubehör(Liste)=Zentralverriegelung
        functional_keywords.Select Accessory    Zentralverriegelung
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19617-PC-188589
    [Tags]    Demo    Systemtest    Testumgebung:HIL 1
    # CarConfig starten
        functional_keywords.Open CarConfig
        functional_keywords.Set Username    schulung20
        functional_keywords.Set Password    @RBTFRMWRK@
        functional_keywords.Click Login Btn
    # Neues Fahrzeug erstellen
        functional_keywords.Click New_Car
    # CarConfig beenden
        functional_keywords.Close CarConfig
