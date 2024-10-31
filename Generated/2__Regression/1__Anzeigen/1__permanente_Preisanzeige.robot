*** Settings ***
Resource    ../../../Resources/functional_keywords.resource
Metadata    UniqueID    iTB-TC-337
Metadata    Name    permanente Preisanzeige
Metadata    Numbering    1.2.1.1
Test Tags    Demo    Automatisiert


*** Test Cases ***
iTB-TC-337-PC-1659
    [Tags]    Demo    Testumgebung:HIL 1
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
    # Sondermodell wählen    Sondermodell=Luxus
        functional_keywords.Select Special Model    Luxus
    # Endpreis prüfen    Endpreis=14,799.99
        functional_keywords.Verify Total Price    14,799.99    €
    # Zubehör wählen    Zubehör(Liste)=Sportfelgen
        functional_keywords.Select Accessory    Sportfelgen
    # Endpreis prüfen    Endpreis=15,699.99
        functional_keywords.Verify Total Price    15,699.99    €
    # Zubehör wählen    Zubehör(Liste)=Lederlenkrad
        functional_keywords.Select Accessory    Lederlenkrad
    # Endpreis prüfen    Endpreis=16,059.99
        functional_keywords.Verify Total Price    16,059.99    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-337-PC-120167
    [Tags]    Demo    Testumgebung:HIL 1
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
    # Sondermodell wählen    Sondermodell=Gomera
        functional_keywords.Select Special Model    Gomera
    # Endpreis prüfen    Endpreis=16,413.00
        functional_keywords.Verify Total Price    16,413.00    €
    # Zubehör wählen    Zubehör(Liste)=Fußmatten
        functional_keywords.Select Accessory    Fußmatten
    # Endpreis prüfen    Endpreis=16,439.00
        functional_keywords.Verify Total Price    16,439.00    €
    # Zubehör wählen    Zubehör(Liste)=Beheizbarer Außenspiegel
        functional_keywords.Select Accessory    Beheizbarer Außenspiegel
    # Endpreis prüfen    Endpreis=16,649.00
        functional_keywords.Verify Total Price    16,649.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig
