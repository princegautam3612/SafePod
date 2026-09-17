from collections.abc import Iterable
from .models import TelemetryEvent

def score_trip(events: Iterable[TelemetryEvent]) -> tuple[int, dict]:
    """Deterministic, explainable initial model; ML may only shadow-score until validated."""
    samples = list(events); harsh = sum((e.acceleration_g or 0) >= 1.35 for e in samples)
    overspeed = sum((e.speed_mps or 0) > 22.22 for e in samples)
    score = max(0, min(100, round(100 - harsh * 4 - overspeed * 0.5)))
    return score, {"model": "rules-v1", "harsh_events": harsh, "overspeed_samples": overspeed, "sample_count": len(samples)}

def crash_signal(event: TelemetryEvent) -> tuple[bool, float]:
    # A single device jolt is never an emergency dispatch. Require confirmation workflow.
    g, speed = event.acceleration_g or 0, event.speed_mps or 0
    confidence = min(0.95, (g / 6) * 0.7 + min(speed / 25, 1) * 0.3)
    return g >= 3.5 and speed >= 5, confidence
