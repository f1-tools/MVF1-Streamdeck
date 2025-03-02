export enum PlayerPickerCaller {
    NONE,
    SYNC,
    PLAY_PAUSE,
    FORWARD,
    REWIND,
    SPEEDOMETER,
    HEADER,
    FULLSCREEN,
    ALWAYS_ON_TOP,
    MUTE,
    VOLUME_UP,
    VOLUME_DOWN
}

export type GlobalSettings = {
    playerPickerCaller: PlayerPickerCaller;
}

export enum PlayerPickerDisplay {
    ALL,
    ONBOARDS_ONLY
}