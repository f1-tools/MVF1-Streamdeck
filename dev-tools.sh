# determine if linux (wsl) or mac
os=$(uname -s)

if [[ "$os" == "Linux" ]]; then
    users=$(ls /mnt/c/Users)
    path=$(echo "/mnt/c/Users")

    # figure out which windows user is currently logged in
    for user in $users; do
        if [[ -d "/mnt/c/Users/$user/AppData/Local/Packages/Microsoft.WindowsTerminal_8wekyb3d8bbwe/LocalState" ]]; then
            # found the user
            echo "user found: $user"
            delpath='C:\Users\'"${user}"'\AppData\Roaming\Elgato\StreamDeck\Plugins\com.f1-tools.mvf1.sdPlugin'
            cpath='C:\Users\'"${user}"'\AppData\Roaming\Elgato\StreamDeck\Plugins'
            break
        else 
            echo "user not (yet?) found"
        fi
    done
    # kill streamdeck using powershell
    powershell.exe -Command "Stop-Process -Name 'StreamDeck'"

    # copy plugin
    # cp -r com.f1-tools.mvf1.sdPlugin "$path/AppData/Roaming/Elgato/StreamDeck/Plugins"
    #remove old plugin first with powershell
    powershell.exe -Command "Remove-Item -Path ${delpath} -Recurse -Force"
    # copy plugin with powershell
    powershell.exe -Command "Copy-Item -Path 'com.f1-tools.mvf1.sdPlugin' -Destination ${cpath} -Recurse"

    # start streamdeck using powershell
    powershell.exe -Command "Start-Process -FilePath 'C:\Program Files\Elgato\StreamDeck\StreamDeck.exe'"
    # open debugger in firefox
    powershell.exe -Command "Start-Process 'C:\Program Files\Mozilla Firefox\firefox.exe' -argumentlist '-url http:localhost:23654'"
elif [[ "$os" == "Darwin" ]]; then
    # mac
    # kill streamdeck
    pkill -a "Elgato Stream Deck"

    # copy plugin
    cp -r com.f1-tools.mvf1.sdPlugin ~/Library/Application\ Support/com.elgato.StreamDeck/Plugins

    # start streamdeck
    open -a "Elgato Stream Deck"
fi
