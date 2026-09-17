# SafeDrive production design

## What runs where

| User-visible | Background / server-controlled |
| --- | --- |
| Start or stop a trip, consent state, latest location/speed, score summary, trip history, coaching, SOS confirmation, wallet and reward status | Device-local telemetry queue, sensor sampling, upload/retry, validation, scoring, reward ledger, crash candidate creation, retention deletion, model monitoring, notifications and audit events |

The UI never fabricates movement, points, or a final score. It presents server-approved results. A browser PWA can collect only while the browser permits it; reliable background location, motion sensing, and crash alerting require a native Android/iOS companion with OS background-location permissions and a foreground-service/background-task implementation.

## Event path

```text
Mobile sensors -> local queue -> POST /trips/{id}/telemetry (idempotency key)
 -> validation + PostgreSQL write -> stream/worker -> rules score + candidate crash
 -> safety event / immutable wallet ledger -> API + push notification
```

Use a transactional outbox before introducing Kafka/SQS. Publish `telemetry.accepted`, `trip.completed`, `crash.candidate`, and `reward.earned`; every consumer must be idempotent. No reward is calculated in the browser.

## Self-learning, safely

1. Start with explainable `rules-v1`, stored on every score.
2. Train only on consented, de-identified feature rows: speed distribution, acceleration percentiles, road class, weather bucket, duration, and confirmed outcomes. Do not train on raw location by default.
3. Maintain a feature registry, time- and driver-separated validation, model cards, bias and calibration checks, and a model registry.
4. Shadow-score new models. Promote only when accuracy, fairness, calibration, and false-negative thresholds pass. Scores affecting insurance, discipline, emergency dispatch, or rewards require human approval and rollback.
5. Collect explicit correction feedback for false crash reports and coaching quality. Keep labels separately, access-controlled, and versioned.

## Crash workflow

An impact is a `possible_crash`, not an automatic emergency call. The app starts a cancel/countdown flow, tries verification, then alerts opted-in contacts with last-known location only under documented consent and escalation rules. Preserve an audit trail. Test with simulated sensor fixtures; never validate by inducing collisions.

## Privacy and security baseline

- Explicit versioned consent for location, sharing, research/model training, and marketing.
- TLS, database encryption, KMS secrets, short-lived JWTs plus refresh rotation, staff MFA/RBAC, rate limits, WAF, and device/session revocation.
- Minimize fields; precise routes expire after 30 days by default, then aggregate or delete. Offer export and deletion workflows.
- Pseudonymize training records, restrict telemetry access, audit staff access, and scan dependencies/images/secrets in CI.
- Obtain local privacy, emergency-contact, and insurance counsel before launch.

## Deployment and launch gates

Deploy API and worker as separate stateless services behind a managed load balancer; use managed PostgreSQL with PITR, Redis, object storage, secret manager, and queue. Monitor latency/errors, upload rejection, queue age, model drift, crash false positives, reward reconciliation, database saturation, and consent/retention failures. Before launch approve the threat model/DPIA, mobile permission UX, emergency escalation, backup restores, offline/retry and duplicate-upload tests, authorization tests, migration tests, and reward reconciliation.
