*** Settings ***
Resource    ../../../Resources/functional_keywords.resource
Metadata    UniqueID    iTB-TC-320
Metadata    Name    Zubehörpreis
Metadata    Numbering    1.2.4.2
Test Tags    Demo    Systemtest    Automatisiert


*** Test Cases ***
iTB-TC-320-PC-1622
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
    # Endpreis prüfen    Endpreis=16,890.00
        functional_keywords.Verify Total Price    16,890.00    €
    # Zubehör wählen    Zubehör(Liste)=Sportfelgen
        functional_keywords.Select Accessory    Sportfelgen
    # Zubehör wählen    Zubehör(Liste)=ABS
        functional_keywords.Select Accessory    ABS
    # Endpreis prüfen    Endpreis=16,890.00
        functional_keywords.Verify Total Price    16,890.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-320-PC-1623
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
    # Endpreis prüfen    Endpreis=17,699.60
        functional_keywords.Verify Total Price    17,699.60    €
    # Zubehör wählen    Zubehör(Liste)=ABS
        functional_keywords.Select Accessory    ABS
    # Zubehör wählen    Zubehör(Liste)=Fensterheber hinten
        functional_keywords.Select Accessory    Fensterheber hinten
    # Zubehör wählen    Zubehör(Liste)=Radio mit CD-Wechsler
        functional_keywords.Select Accessory    Radio mit CD-Wechsler
    # Zubehör wählen    Zubehör(Liste)=Fußmatten
        functional_keywords.Select Accessory    Fußmatten
    # Zubehör wählen    Zubehör(Liste)=Zentralverriegelung
        functional_keywords.Select Accessory    Zentralverriegelung
    # Endpreis prüfen    Endpreis=17,699.60
        functional_keywords.Verify Total Price    17,699.60    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-320-PC-1624
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
    # Endpreis prüfen    Endpreis=18,949.10
        functional_keywords.Verify Total Price    18,949.10    €
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
    # Endpreis prüfen    Endpreis=18,949.10
        functional_keywords.Verify Total Price    18,949.10    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-320-PC-389172
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
    # Endpreis prüfen    Endpreis=15,000.00
        functional_keywords.Verify Total Price    15,000.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig
