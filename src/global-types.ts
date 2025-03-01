export enum PlayerPickerCaller {
    NONE,
    SYNC,
    PLAY_PAUSE,
    FORWARD,
    REWIND,
    SPEEDOMETER
}

export type GlobalSettings = {
    playerPickerCaller: PlayerPickerCaller;
}

export enum PlayerPickerDisplay {
    ALL,
    ONBOARDS_ONLY
}