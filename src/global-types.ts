export enum PlayerPickerCaller {
    NONE,
    SYNC,
    PLAY_PAUSE,
    FORWARD,
    REWIND,
    SPEEDOMETER,
    HEADER
}

export type GlobalSettings = {
    playerPickerCaller: PlayerPickerCaller;
}

export enum PlayerPickerDisplay {
    ALL,
    ONBOARDS_ONLY
}