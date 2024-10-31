*** Settings ***
Resource    ../../../../Resources/functional_keywords.resource
Metadata    UniqueID    itb-TC-19622
Metadata    Name    Fahrzeug- und Zubehörpreise
Metadata    Numbering    1.2.3.2.3
Test Tags    Demo    Systemtest    Automatisiert


*** Test Cases ***
itb-TC-19622-PC-119739
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
    # Zubehör wählen    Zubehör(Liste)=Lederlenkrad
        functional_keywords.Select Accessory    Lederlenkrad
    # Endpreis prüfen    Endpreis=15,360.00
        functional_keywords.Verify Total Price    15,360.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19622-PC-119738
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
    # Zubehör wählen    Zubehör(Liste)=Beheizbarer Außenspiegel
        functional_keywords.Select Accessory    Beheizbarer Außenspiegel
    # Endpreis prüfen    Endpreis=15,210.00
        functional_keywords.Verify Total Price    15,210.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19622-PC-119737
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
    # Zubehör wählen    Zubehör(Liste)=Zentralverriegelung
        functional_keywords.Select Accessory    Zentralverriegelung
    # Endpreis prüfen    Endpreis=16,200.00
        functional_keywords.Verify Total Price    16,200.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19622-PC-119736
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
    # Endpreis prüfen    Endpreis=15,900.00
        functional_keywords.Verify Total Price    15,900.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19622-PC-119743
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
    # Zubehör wählen    Zubehör(Liste)=ABS
        functional_keywords.Select Accessory    ABS
    # Endpreis prüfen    Endpreis=15,990.00
        functional_keywords.Verify Total Price    15,990.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19622-PC-119742
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
    # Zubehör wählen    Zubehör(Liste)=Fensterheber hinten
        functional_keywords.Select Accessory    Fensterheber hinten
    # Endpreis prüfen    Endpreis=15,490.00
        functional_keywords.Verify Total Price    15,490.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19622-PC-119741
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
    # Zubehör wählen    Zubehör(Liste)=Radio mit CD-Wechsler
        functional_keywords.Select Accessory    Radio mit CD-Wechsler
    # Endpreis prüfen    Endpreis=15,470.00
        functional_keywords.Verify Total Price    15,470.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19622-PC-119740
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
    # Zubehör wählen    Zubehör(Liste)=Fußmatten
        functional_keywords.Select Accessory    Fußmatten
    # Endpreis prüfen    Endpreis=15,026.00
        functional_keywords.Verify Total Price    15,026.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig
