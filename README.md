# Index — downloads

Index is een privacy-first app voor je persoonlijke financiën. Al je gegevens blijven versleuteld op je eigen computer. Er gaat niets naar een server.

In deze repository staan alleen de installers en de updatebestanden. Je downloadt Index één keer. Daarna laat de app zelf weten wanneer er een nieuwe versie is en werkt hij zichzelf bij.

## Downloaden

Op de **[downloadpagina](https://mitaadevelop.github.io/Index/)** kies je met één knop de juiste versie voor je computer. Je kunt ook hieronder zelf een bestand kiezen.

| Platform | Download |
|---|---|
| macOS: Apple Silicon (M1 en nieuwer) | [index-macos-apple-silicon.dmg](https://github.com/mitaadevelop/Index/releases/latest/download/index-macos-apple-silicon.dmg) |
| macOS: Intel | [index-macos-intel.dmg](https://github.com/mitaadevelop/Index/releases/latest/download/index-macos-intel.dmg) |
| Windows 10 en 11 | [index-windows-setup.exe](https://github.com/mitaadevelop/Index/releases/latest/download/index-windows-setup.exe) |
| Linux: AppImage | [index-linux.AppImage](https://github.com/mitaadevelop/Index/releases/latest/download/index-linux.AppImage) |
| Linux: Debian of Ubuntu | [index-linux.deb](https://github.com/mitaadevelop/Index/releases/latest/download/index-linux.deb) |

Weet je niet welke Mac je hebt? Kies in het Apple-menu linksboven *Over deze Mac*. Staat er "Chip Apple M…", neem dan Apple Silicon. Staat er "Processor … Intel", neem dan Intel.

Alle versies en release-notes staan onder [Releases](https://github.com/mitaadevelop/Index/releases).

## De eerste keer openen

Index is nog niet ondertekend bij Apple of Microsoft. Daarom waarschuwt je computer je de eerste keer dat je de app opent.

### macOS

1. Open de `.dmg` en sleep Index naar *Apps*.
2. Open Index. Je krijgt een melding dat de app niet gecontroleerd kan worden.
3. Ga naar *Systeeminstellingen → Privacy en beveiliging*, scroll naar beneden en klik bij Index op *Open toch*.

Zegt macOS dat de app "beschadigd" is, voer dan dit uit in Terminal en open Index opnieuw:

```
xattr -cr /Applications/Index.app
```

### Windows

Krijg je de melding "Windows heeft uw pc beschermd", kies dan *Meer info* en daarna *Toch uitvoeren*.

### Linux

Gebruik een van deze twee:
- **AppImage:** maak het bestand uitvoerbaar met `chmod +x index-linux.AppImage` en start het.
- **Debian of Ubuntu:** installeer de `.deb` met `sudo apt install ./index-linux.deb`.

## Updates

Index laat zelf weten wanneer er een nieuwe versie is en installeert die met één klik. Je gegevens blijven daarbij gewoon bewaard. Het automatisch zoeken naar updates zet je uit onder *Instellingen → Over & updates*.
