export type JSONObject = Record<string, unknown>;
export type BigIntScalar = number;

export interface Query {
    version: string;
    systemInfo: SystemInfo;
    players: Player[];
    player: Player;
    liveTimingState?: LiveTimingState;
    liveTimingClock?: LiveTimingClock;
    f1LiveTimingState?: F1LiveTimingState;
    f1LiveTimingClock?: F1LiveTimingClock;
    fiawecLiveTimingState?: FIAWECLiveTimingState;
    activeSubscriptions: Subscription[];
}

export interface SystemInfo {
    platform: string;
    arch: string;
}

export interface Player {
    id: string;
    type: PlayerType;
    state?: PlayerState;
    driverData?: PlayerDriverData;
    streamData?: PlayerStreamData;
    bounds: Rectangle;
    fullscreen: boolean;
    alwaysOnTop: boolean;
    maintainAspectRatio: boolean;
}

export interface PlayerState {
    ts: number;
    paused: boolean;
    muted: boolean;
    volume: number;
    live: boolean;
    currentTime?: number;
    interpolatedCurrentTime?: number;
}

export interface PlayerDriverData {
    driverNumber: number;
    tla: string;
    firstName: string;
    lastName: string;
    teamName: string;
}

export interface PlayerStreamData {
    contentId?: string;
    meetingKey?: string;
    sessionKey?: string;
    channelId?: number;
    title?: string;
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export enum PlayerType {
    ADDITIONAL = "ADDITIONAL",
    OBC = "OBC",
}

export enum AlwaysOnTopLevel {
    NORMAL = "NORMAL",
    FLOATING = "FLOATING",
    TORN_OFF_MENU = "TORN_OFF_MENU",
    MODAL_PANEL = "MODAL_PANEL",
    MAIN_MENU = "MAIN_MENU",
    STATUS = "STATUS",
    POP_UP_MENU = "POP_UP_MENU",
    SCREEN_SAVER = "SCREEN_SAVER",
}

export enum DriverHeaderMode {
    NONE = "NONE",
    OBC_LIVE_TIMING = "OBC_LIVE_TIMING",
    DRIVER_HEADER = "DRIVER_HEADER",
}

export interface LiveTimingState {
    ArchiveStatus?: JSONObject;
    AudioStreams?: JSONObject;
    CarData?: JSONObject;
    ChampionshipPrediction?: JSONObject;
    ContentStreams?: JSONObject;
    DriverList?: JSONObject;
    ExtrapolatedClock?: JSONObject;
    Heartbeat?: JSONObject;
    LapCount?: JSONObject;
    LapSeries?: JSONObject;
    PitLaneTimeCollection?: JSONObject;
    Position?: JSONObject;
    RaceControlMessages?: JSONObject;
    SessionData?: JSONObject;
    SessionInfo?: JSONObject;
    SessionStatus?: JSONObject;
    TeamRadio?: JSONObject;
    TimingAppData?: JSONObject;
    TimingData?: JSONObject;
    TimingStats?: JSONObject;
    TopThree?: JSONObject;
    TrackStatus?: JSONObject;
    WeatherData?: JSONObject;
    WeatherDataSeries?: JSONObject;
}

export interface F1LiveTimingState {
    ArchiveStatus?: JSONObject;
    AudioStreams?: JSONObject;
    CarData?: JSONObject;
    ChampionshipPrediction?: JSONObject;
    ContentStreams?: JSONObject;
    DriverList?: JSONObject;
    ExtrapolatedClock?: JSONObject;
    Heartbeat?: JSONObject;
    LapCount?: JSONObject;
    LapSeries?: JSONObject;
    PitLaneTimeCollection?: JSONObject;
    Position?: JSONObject;
    RaceControlMessages?: JSONObject;
    SessionData?: JSONObject;
    SessionInfo?: JSONObject;
    SessionStatus?: JSONObject;
    TeamRadio?: JSONObject;
    TimingAppData?: JSONObject;
    TimingData?: JSONObject;
    TimingStats?: JSONObject;
    TopThree?: JSONObject;
    TrackStatus?: JSONObject;
    WeatherData?: JSONObject;
    WeatherDataSeries?: JSONObject;
}

export interface LiveTimingClock {
    paused: boolean;
    systemTime: BigIntScalar;
    trackTime: BigIntScalar;
    liveTimingStartTime: BigIntScalar;
}

export interface F1LiveTimingClock {
    paused: boolean;
    systemTime: BigIntScalar;
    trackTime: BigIntScalar;
    liveTimingStartTime: BigIntScalar;
}

export interface FIAWECLiveTimingState {
    entries?: JSONObject;
    referential?: JSONObject;
    params?: JSONObject;
    flags?: JSONObject;
    best_sectors?: JSONObject;
    race_control?: JSONObject;
    laps?: JSONObject;
    stints?: JSONObject;
}

export interface Subscription {
    subscriptionType: SubscriptionType;
    expiresAt?: number;
    signature: string;
}

export enum SubscriptionType {
    F1TV_PRO = "F1TV_PRO",
    F1TV_ACCESS = "F1TV_ACCESS",
    F1_ACCESS = "F1_ACCESS",
}