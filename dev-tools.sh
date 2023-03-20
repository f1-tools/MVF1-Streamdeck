# determine if linux (wsl) or mac
os=$(uname -s)

if [[ "$os" == "Linux" ]]; then
    users=$(ls /mnt/c/Users)
    path=$(echo "/mnt/c/Users")

    # figure out which windows user is currently logged in
    for user in $users; do
        if [[ -d "/mnt/c/Users/$user/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState" ]]; then
            # found the user
            path=$(echo "/mnt/c/Users/$user")
            break
        fi
    done

    # kill streamdeck using powershell
    powershell.exe -Command "Stop-Process -Name 'StreamDeck'"

    # copy plugin
    cp -r com.f1-tools.mvf1.sdPlugin "$path/AppData/Roaming/Elgato/StreamDeck/Plugins"

    # start streamdeck using powershell
    powershell.exe -Command "Start-Process -FilePath 'C:\Program Files\Elgato\StreamDeck\StreamDeck.exe'"
elif [[ "$os" == "Darwin" ]]; then
    # mac
    # kill streamdeck
    pkill -a "Elgato Stream Deck"

    # copy plugin
    cp -r com.f1-tools.mvf1.sdPlugin ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins

    # start streamdeck
    open -a "Elgato Stream Deck"
fi
