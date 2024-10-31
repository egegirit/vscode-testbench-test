*** Settings ***
Resource    ../../../../Resources/functional_keywords.resource
Metadata    UniqueID    itb-TC-19628
Metadata    Name    Rücksetzen nach Konfig
Metadata    Numbering    1.2.2.3.1
Test Tags    Demo    Systemtest


*** Test Cases ***
itb-TC-19628-PC-120085
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
    # Sondermodell wählen    Sondermodell=Keine
        functional_keywords.Select Special Model    Keine
    # Endpreis prüfen    Endpreis=12,300.00
        functional_keywords.Verify Total Price    12,300.00    €
    # Fahrzeug wählen    Fahrzeug=Minigolf
        functional_keywords.Select Base Model    Minigolf
    # Sondermodell wählen    Sondermodell=Jazz
        functional_keywords.Select Special Model    Jazz
    # Zubehör wählen    Zubehör(Liste)=Lederlenkrad
        functional_keywords.Select Accessory    Lederlenkrad
    # Zubehör wählen    Zubehör(Liste)=Beheizbarer Außenspiegel
        functional_keywords.Select Accessory    Beheizbarer Außenspiegel
    # Zubehör wählen    Zubehör(Liste)=Zentralverriegelung
        functional_keywords.Select Accessory    Zentralverriegelung
    # Endpreis prüfen    Endpreis=17,819.00
        functional_keywords.Verify Total Price    17,819.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

itb-TC-19628-PC-120096
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
    # Sondermodell wählen    Sondermodell=Luxus
        functional_keywords.Select Special Model    Luxus
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
    # Endpreis prüfen    Endpreis=24,949.09
        functional_keywords.Verify Total Price    24,949.09    €
    # Fahrzeug wählen    Fahrzeug=Rolo
        functional_keywords.Select Base Model    Rolo
    # Sondermodell wählen    Sondermodell=Keine
        functional_keywords.Select Special Model    Keine
    # Endpreis prüfen    Endpreis=12,300.00
        functional_keywords.Verify Total Price    12,300.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig
