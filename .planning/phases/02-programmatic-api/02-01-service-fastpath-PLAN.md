---
wave: 1
depends_on: []
files_modified: [lib/torrentService.js]
autonomous: true
---

# Plan: Service Enhancements for Fast-Path

## Goal
Update 	orrentService.js to support an optional fast-path that skips time-consuming health checks during torrent parsing.

## Tasks

<task id="1" name="Update handleTorrentSource signature">
Modify handleTorrentSource in lib/torrentService.js to accept an options object as the third parameter.

`javascript
async function handleTorrentSource(source, isMagnet = false, options = {})
`

Ensure default options is an empty object.

<verify>
lib/torrentService.js has the updated function signature.
</verify>
</task>

<task id="2" name="Implement skipHealth logic" depends_on="1">
In handleTorrentSource, use the skipHealth property from the options object to conditionally execute the webtorrent-health check.

Logic:
- If options.skipHealth is true, set healthData to default { seeds: 0, peers: 0 } and skip the health(parsed) call.
- Otherwise, proceed with the health check as currently implemented.

<verify>
The code contains a conditional check for options.skipHealth before calling health(parsed).
</verify>
</task>

## must_haves

Goal: Support skipping health checks in 	orrentService.js.

- [ ] handleTorrentSource accepts an options object.
- [ ] Passing { skipHealth: true } prevents the health check from running.
- [ ] Default behavior (no options) still performs the health check.
- [ ] Function continues to return the full TorrentMetadata structure even when health is skipped (with 0 seeds/peers).
