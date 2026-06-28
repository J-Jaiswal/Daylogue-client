import React from "react";
import { useSleep } from "../../../hooks/useSleep";
import SleepIdle from "./SleepIdle";
import SleepRecording from "./SleepRecording";
import WakeUpConfirm from "./WakeUpConfirm";
import SleepCompleted from "./SleepCompleted";
import StaleSessionRecovery from "./StaleSessionRecovery";
import NapSection from "./NapSection";

export default function SleepSection({ sleepHelper }) {
  const localSleep = useSleep();
  const helper = sleepHelper || localSleep;

  const {
    sleepState,
    setSleepState,
    activeSession,
    sleepEntry,
    startSleep,
    confirmWakeUp,
    cancelSleep,
    naps,
    addNap,
    deleteNap,
    deleteSleep,
    loading,
  } = helper;

  if (loading) {
    return (
      <div className="log-loading-wrap" style={{ minHeight: "150px" }}>
        <div className="log-loading-spinner" />
        <p className="log-loading">Updating sleep status…</p>
      </div>
    );
  }

  return (
    <div className="sleep-form-flat">
      {sleepState === "IDLE" && (
        <SleepIdle startSleep={startSleep} />
      )}
      {sleepState === "SLEEPING" && (
        <SleepRecording
          activeSession={activeSession}
          cancelSleep={cancelSleep}
          onWakeUp={() => setSleepState("WAKING_CONFIRM")}
        />
      )}
      {sleepState === "WAKING_CONFIRM" && (
        <WakeUpConfirm
          activeSession={activeSession}
          confirmWakeUp={confirmWakeUp}
          onNotYet={() => setSleepState("SLEEPING")}
        />
      )}
      {sleepState === "COMPLETED" && (
        <SleepCompleted sleepEntry={sleepEntry} deleteSleep={deleteSleep} />
      )}
      {sleepState === "STALE" && (
        <StaleSessionRecovery
          activeSession={activeSession}
          confirmWakeUp={confirmWakeUp}
          cancelSleep={cancelSleep}
        />
      )}

      <NapSection
        naps={naps}
        addNap={addNap}
        deleteNap={deleteNap}
      />
    </div>
  );
}
