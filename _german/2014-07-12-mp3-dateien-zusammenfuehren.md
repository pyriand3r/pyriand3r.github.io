---
layout: post
title: mp3-Dateien zusammenführen
categories: python
comments: true
excerpt: <code>Aufwärmübung</code> Anhand eines kleinen Scriptes, dass mp3-Dateien konkatiniert erfahrt Ihr, wie man in Python beim Script-Aufruf Parameter übergibt und Module importiert.
---

>#### Motivation
>
>Ich liebe Hörspiele. Wenn man allerdings eine CD ripped oder sich ein Hörspiel direkt als mp3 kauft, bekommt man den Hörgenuss grundsätzlich als track-by-track-Variante. Ich hab' meine Hörspiele lieber als single-track-Versionen, also immer hübsch eine Datei pro Folge.
>
>Will man nun per Hand aus einer track-by-track-Version eine single-file-Version machen, muss man über die Konsole per `cat`-Befehl oder ähnlichem alle Dateien aneinanderfügen und dann den Header der neuen mp3-Datei reparieren, damit der Track auch die richige Länge hat. Das kann bei mehreren Folgen schon mühsam (und nervig) werden... und es schreit förmlich nach einem Script. Meine Scripte - zumindest die, die aus mehr als einer Aneinanderreihung von Bash-Befehlen bestehen - schreibe ich aus Gewohnheit in Python. Ich mag einfach die klare Struktur der Sprache.

### Was muss das Script machen?

Also, mp3-Dateien zu einem großen Track konkatinieren. Wann das sinnvoll sein soll? **Lies den Abschnitt Motivation!**

Kann's losgehen? Gut. Als erstes einmal fassen wir zusammen, was das Script tun soll: Alle mp3-Dateien einer Hörspielfolge liegen in einem Ordner und sind irgendwie (sinnvoll) benamt. Das Script braucht also zum Start schonmal den Pfad zum Ausgangsordner, damit es die Dateien findet. Gibt ja (leider/zum Glück) noch kein Telekinese-Modul.

### Werte beim Script-Aufruf übergeben

Zunächst muss dem Script mitgeteilt werden, welche Dateien zusammengefügt werden und wo und unter welchem Namen es anschließend die neue Datei speichern soll. Dafür gibt es in Python das `argparse`-Modul, mit dessen Hilfe man Argumente definieren kann. Über diese Argumente kann man beim Scriptaufruf Werte mitgeben.

{% highlight python %}
import argparse

[...]

argp = argparse.ArgumentParser(description=__doc__)
argp.add_argument(
    "-src", "--source", default=None,
    help="Folder with mp3-files to concatinate")
argp.add_argument(
    "-dest", "--destination", default=None,
    help="Target-file")
args = argp.parse_args()
{% endhighlight %}

Zunächst wird das `argparse`-Modul mit Hilfe des `import`-Befehls verfügbar gemacht. Im Anschluss (ich mache das immer am Ende der Scriptdatei vor dem Startparameter) kann ein `argp`-Objekt erzeugt werden. Diesem können mit Hilfe des Funktionsaufrufes `.add_argument()` beliebig viele Argument-Definitionen hinzugefügt werden.

> #### Mit add_arguments() Argument hinzufügen
> 
> Der `add_argument()`-Funktion müssen vier Attribute übergeben werden:
> 
> 1. Kurzform des Arguments `-dest`
> 2. Langform des Arguments `--destination` (Dieser Wert wird als Attributname übernommen, soll heißen, über diesen Namen kann später auf den Wert zugegriffen werden. Im Beispiel hier: `args.destination` und `args.source`)
> 3. `default=Wert`: Ein default-Wert der benutzt wird, wenn kein Wert übergeben wurde
> 4. `help="String"`: Ein Hilfetext der angezeigt wird, wenn das Script mit dem Argument `-h` aufgerufen wird.

Wenn man nun das Script mit dem Befehl `python mp3join.py -src "/pfad/zu/Dateien" -dest "/neue/Datei.mp3"` aufruft, sind die beiden Pfadangaben im Script verfügbar. Bevor wir uns anschauen wie man diese nutzt, sollten wir sicherstellen dass sie auch wirklich mit übergeben wurden.

### Argument-Nutzung erzwingen

Nachdem die Argumente definiert sind, können sie ganz einfach über eine `if`-Abfrage validiert werden (sie sind Attribute des Objekts `args`). Ist der Wert des Attributs der default-Wert - wurde das Argument also nicht übergeben - soll das Script einen Info-Text ausgeben, der die Funktionsweise erklärt:

{% highlight python %}
if args.source is None:
    print "Please provide a folder with mp3-files to concatinate. [-scr <folderpath> (absoulte)]"
elif args.destination is None:
    print "Please specify a destination file to concatinate to. [-dest <filepath> (absolute)]"
else:
    mp3join(args.source, args.destination)
{% endhighlight %}

Die letzte Zeile zeigt zudem, wie die Argumente an eine Funktion übergeben werden können. In diesem Fall müsste die Übergabe nicht sein. Da das `args`-Objekt auf der obersten Ebene des Scripts initialisiert wurde und nicht innerhalb einer bestimmten Funktion, ist es im gesamten Script verfügbar und man könnte auch innerhalb einer Funktion direkt darauf zugreifen. So wie hier beschrieben ist es aber sauberer, da die Daten, welche die Funktion `mp3join` benötigt, direkt im Aufruf übergeben werden.

### Das eigentliche Script

Kommen wir nun zum eigentlichen Vorgang:

{% highlight python %}
def mp3join(src, dest):
    #list all mp3-files and sort them magically
    filelist = glob(src + "/*.mp3")
    filelist = sorted(filelist)

    #Copy first file into tmp
    print "Kopiere %s nach /tmp/tmp1.mp3" % filelist[0]
    os.system("cp '%s' /tmp/tmp1.mp3" % filelist[0])
    filelist.pop(0)

    #concatinate all file to tmp-file
    for mp3 in filelist:
        print "füge %s hinzu" % mp3
        os.system("cat /tmp/tmp1.mp3 '%s' > /tmp/tmp2.mp3" % mp3)
        os.system("mv /tmp/tmp2.mp3 /tmp/tmp1.mp3")

    #repair the header
    os.system("avconv -i /tmp/tmp1.mp3 -acodec copy '%s'" % dest)
    
    #Clean temp
    os.system("rm /tmp/tmp1.mp3")
{% endhighlight %}

#### Dateiliste holen

Zunächst holen wir eine Liste aller mp3-Dateien im `source`-Ordner. Das funktioniert mit der Funktion `glob` des gleichnamigen Objekts `glob` ganz wunderbar.

> #### Module in Python importieren
> 
> Um in Python Module in ein Skript/eine Klasse zu importieren, gibt es mehrere Möglichkeiten:
> 
> 1. `import x`: Importiert das Modul X in den aktuelle Namespace. Dadurch kann über `x.name` auf Funktionen etc. innerhalb des Moduls X zugegriffen werden.
> 2. `from x import */name`: Importiert alle bzw. die angegebenen Elemente aus dem Modul X und registriert sie unter ihrem Namen im aktuellen Namespace. Dadurch kann über `name` direkt auf die importierten Funktionen zugegriffen werden.
> 3. `name = __import__('x')`: Importiert das Modul X und registriert es unter `name` im aktuellen Namespace. Der Modulname wird als String übergeben und `name` kann frei gewählt werden.
> 
> Was man nun verwenden möchte, ist jedem selbst überlassen. Am gebräuchlichsten (und ganz ehrlich auch für anderen am verständlichsten) sind 1. und 2.

#### Dateiliste sortieren

Über den `sorted(<array>)`-Befehl wird die Liste sortiert, soll heißen: Je nachdem, wie die Tracks benannt sind, sortiert `sorted` aufsteigend nach Zahlen und/oder Buchstaben **den gesamten Dateinamen**. Selbst Tracks, die nach dem Schema `Foobar - 01 - xyz.mp3` benannt sind, werden korrekt sortiert  
"That's Python-Magic, Baby!"

#### Zusammenfügen

Erstmal 

### Script bei Gist

Das vollständige Script gibt es auch bei Gist zum [Download](https://gist.github.com/pyriand3r/850156745a6c0a5edd4d#file-mp3jobin-py).

### Quellen

- http://effbot.org/zone/import-confusion.htm