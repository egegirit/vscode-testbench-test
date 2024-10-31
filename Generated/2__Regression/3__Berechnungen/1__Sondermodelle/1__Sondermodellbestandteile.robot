*** Settings ***
Resource    ../../../../Resources/functional_keywords.resource
Metadata    UniqueID    iTB-TC-338
Metadata    Name    Sondermodellbestandteile
Metadata    Numbering    1.2.3.1.1
Test Tags    Demo    Systemtest    Automatisiert    Betriebssystem:beide


*** Test Cases ***
iTB-TC-338-PC-1660
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
    # Zubehör wählen    Zubehör(Liste)=Zentralverriegelung
        functional_keywords.Select Accessory    Zentralverriegelung
    # Zubehör wählen    Zubehör(Liste)=Fensterheber hinten
        functional_keywords.Select Accessory    Fensterheber hinten
    # Zubehör wählen    Zubehör(Liste)=Sportfelgen
        functional_keywords.Select Accessory    Sportfelgen
    # Endpreis prüfen    Endpreis=17,313.00
        functional_keywords.Verify Total Price    17,313.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-338-PC-1661
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
    # Zubehör wählen    Zubehör(Liste)=Radio mit CD-Wechsler
        functional_keywords.Select Accessory    Radio mit CD-Wechsler
    # Zubehör wählen    Zubehör(Liste)=Fußmatten
        functional_keywords.Select Accessory    Fußmatten
    # Zubehör wählen    Zubehör(Liste)=Sportfelgen
        functional_keywords.Select Accessory    Sportfelgen
    # Endpreis prüfen    Endpreis=16,049.00
        functional_keywords.Verify Total Price    16,049.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-338-PC-1662
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
    # Zubehör wählen    Zubehör(Liste)=Zentralverriegelung
        functional_keywords.Select Accessory    Zentralverriegelung
    # Zubehör wählen    Zubehör(Liste)=ABS
        functional_keywords.Select Accessory    ABS
    # Zubehör wählen    Zubehör(Liste)=Fensterheber hinten
        functional_keywords.Select Accessory    Fensterheber hinten
    # Zubehör wählen    Zubehör(Liste)=Radio mit CD-Wechsler
        functional_keywords.Select Accessory    Radio mit CD-Wechsler
    # Endpreis prüfen    Endpreis=17,499.99
        functional_keywords.Verify Total Price    17,499.99    €
    # CarConfig beenden
        functional_keywords.Close CarConfig

iTB-TC-338-PC-195545
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
    # Sondermodell wählen    Sondermodell=Keine
        functional_keywords.Select Special Model    Keine
    # Endpreis prüfen    Endpreis=0.00
        functional_keywords.Verify Total Price    0.00    €
    # CarConfig beenden
        functional_keywords.Close CarConfig
