# AI Context: BlossomOS Arc Store & Services

This document provides detailed context for the AI assistant about Arc Store capabilities, available web apps, package managers, and APIs. This is internal documentation not shown to users.

## Web Apps Available in Arc Store

The PWA wrapper in Arc can install these web services as native desktop applications:

### Streaming & Media

- **Netflix** - Subscription streaming service for movies and TV shows. Supports offline viewing on mobile, smart recommendations, up to 5 profiles per account.
- **Amazon Prime Video (DE)** - Films and series streaming with exclusive originals. German regional version.
- **YouTube** - Video platform with tutorials, music, entertainment, livestreams, and creator content.
- **Spotify** - Music streaming and podcast service (via web player).
- **Twitch** - Live streaming platform for gaming and creative content.

### Communication & Messaging

- **WhatsApp** - E2E-encrypted messaging and video calling. 1-1 and group chats, file sharing, status updates, up to 32 participants in calls.
- **Telegram** - Messaging service with channels and groups.
- **Discord** - Team communication and community platform. Alternative to native app.
- **Slack** - Team messaging and collaboration workspace.
- **Microsoft Teams** - Corporate collaboration with chat, calls, meetings, file sharing, calendar tools, and Microsoft 365 integration.
- **Instagram** - Social network with Reels, Stories, Feed, and shopping.
- **Pinterest** - Visual inspiration platform for DIY, fashion, recipes, home decor.

### Productivity & AI

- **Claude (Claude.ai)** - Anthropic's AI assistant for writing, coding, research, document analysis, long-context understanding, and complex problem-solving. Supports file uploads (documents, PDFs, images, screenshots).
- **ChatGPT** - OpenAI's AI assistant. Supports questions, writing, learning, coding, and creative ideas.
- **Notion** - Workspace for notes, databases, and collaboration.
- **Linear** - Issue tracking and project management.
- **Figma** - Design tool (no Linux native app, PWA is best alternative).
- **GitHub** - Version control and collaboration platform accessible via web.
- **Google Workspace** - Google Drive, Docs, Sheets, Slides as individual PWAs.

### Banking & Finance

- **finanzblick Online-Banking** - German banking app aggregating 4,000+ banks. Auto-categorization of income/expenses, budgets, tax category mapping, screenshot bill payment, loyalty card storage, ATM finder.
- **WISO Steuer** - German tax filing application with step-by-step guidance, automatic tax savings detection, multi-situation support (employees, students, self-employed).
- **BiBox** - Digital schoolbook platform for teachers and students. Interactive content, offline access, assignment tools, multimedia materials.

## Arc Store Architecture

Arc is a unified Linux software manager built as a Cargo workspace with four crates:

1. **libarc** - Shared types and D-Bus client library. Provides `ArcDaemonProxy` for session bus communication.

2. **arc-daemon** - Long-running D-Bus service (`dev.arc.ArcDaemon1`) managing two providers:
   - **FlatpakProvider** - Uses libflatpak to search and manage Flatpak packages. Shells out to `flatpak search` for queries. Scans both user and system installations.
   - **PackageKitProvider** - Communicates with system PackageKit daemon for native distro packages.
   - **MultiProvider** - Wraps both. Search/list/update queries fan out to BOTH providers in parallel and merge results. Mutating operations route to the appropriate provider based on package ID format.

3. **arc-cli** - Command-line tool:
   - `arc search <query>` - searches all available sources in parallel
   - `arc install <app_id>` - installs from appropriate provider
   - `arc remove <app_id>` - removes packages
   - `arc update` - updates all apps and system
   - `arc list` - lists all installed apps

4. **arc-frontend** - GUI built with Slint. Connects to daemon at startup, loads installed apps, presents searchable package list with progress tracking.

## Arc Live APIs (use these for current data)

### Arc Core Search API

**Endpoint:** `https://arpi.blossomos.org/api/v1/search`
**Method:** GET
**Query parameter:** `?q=<search_term>`
**Returns:** JSON array of package results (Flatpak + native packages merged)

Example: `https://arpi.blossomos.org/api/v1/search?q=firefox`

Searches both Flatpak (Flathub integrated) and native package repos simultaneously. The Arc daemon handles all merging/deduplication behind the scenes.

### Arc Forge API (PWA Store)

**Endpoint:** `https://forge.blossomos.org/api/pwas`
**Method:** GET
**Returns:** Array of PWA app objects with full metadata

**Response fields per app:**

- `id` - unique app ID (e.g., `com.netflix.App`)
- `appid` - alternative ID format
- `name` - display name
- `summary` - one-line description
- `description` - full HTML description with features
- `url` - the web URL to wrap as native app
- `homepage_url` - official homepage
- `icon_url` - app icon URL (CDN hosted)
- `screenshots[]` - array of screenshot URLs
- `developer_name` - app developer/publisher
- `verified` - boolean, Blossom-verified app
- `content_rating` - e.g., "All ages"
- `color` - brand color for window frame
- `css` - custom CSS injection URL (if needed)
- `js` - custom JavaScript injection URL (if needed)
- `useragent` - custom user agent string (if required)
- `widevine` - boolean, DRM video playback needed (Netflix, Amazon Prime)
- `tray` - boolean, system tray support (WhatsApp)

**Arc Forge also manages:**

- PWA app metadata and store listing
- Lutris game whitelist curation
- Store homepage visual editor
- Public APIs consumed by Arc frontend

## Package Manager Layers via pkglayer

pkglayer containers available in Arc:

| Option     | Command                   | Distro Base            | Best For                                              |
| ---------- | ------------------------- | ---------------------- | ----------------------------------------------------- |
| **apt**    | `apt install pkg`         | Debian/Ubuntu          | Largest package count, most Linux users familiar      |
| **yay**    | `yay -S pkg`              | Arch (AUR)             | Access to Arch User Repository, cutting-edge packages |
| **dnf**    | `dnf install pkg`         | Fedora                 | Native Fedora packages in isolated environment        |
| **nix**    | `nix-env -iA nixpkgs.pkg` | NixOS                  | Reproducible builds, massive package count            |
| **emerge** | `emerge pkg`              | Gentoo                 | Source-based, maximum control                         |
| **brew**   | `brew install pkg`        | Homebrew (independent) | macOS-style package management, developer tools       |

All containers run via Distrobox. Installed packages appear on system `$PATH` immediately and are isolated from the host.

## Flatpak Ecosystem

Flatpak source: **Flathub** (`https://flathub.org`)

Key facts:

- Sandboxed packages with explicit permission grants
- Automatic security isolation (filesystems, networks, D-Bus access)
- Independent update cycle from system
- No host system modification
- All permissions visible to user before install

Common Flatpak apps available via Arc Store:

- Firefox, Thunderbird, Chromium, Edge
- VLC, Audacity, Blender, GIMP, Inkscape
- LibreOffice, Krita, OBS, Zoom, Element (Matrix), Nextcloud
- RetroArch, Dolphin (emulators)

## Windows Apps & Wine Support

Arc Winapps wraps Windows applications via Wine/Proton. Pre-configured packages:

| App                    | Windows Version | Wine Method   | Status           |
| ---------------------- | --------------- | ------------- | ---------------- |
| Affinity v3            | Latest          | Wine + DXVK   | Fully functional |
| Battle.net             | Latest          | Wine + Proton | Fully functional |
| (More added regularly) |                 |               |                  |

For unlisted Windows apps:

- **Lutris** - community install scripts for hundreds of games/apps
- **Manual Wine via Distrobox** - full control, run any distro's Wine
- **Steam + Proton** - best for Windows games

## Distrobox Integration

Distrobox provides three modes:

1. **pkglayer containers** - persistent, on $PATH, automatic background management
2. **Ephemeral container** - temporary, single-use, auto-cleaned on exit
3. **Manual Distrobox** - persistent custom containers, manually managed

Available distros: Debian, Ubuntu, Arch, Fedora, Alpine, CentOS, AlmaLinux, Gentoo, Void, Nixos.

## Arc Winapps Technology

Arc Winapps uses Wine to run Windows applications natively on Linux:

- Install and run Windows .exe files via Wine
- Present each app as a native launcher entry
- Full file access to host directories
- GPU acceleration support
- Direct X11/Wayland integration

Result: Windows apps appear and behave like native Linux apps - click and run.

## Common Installation Patterns

### "I want to use X software on BlossomOS"

**For desktop apps:**

1. **Search Arc Store** - searches Flatpak (Flathub integrated) + native packages simultaneously
2. **Use Arc CLI** - `arc search firefox` searches all sources

**For CLI/developer tools:**

1. **Search Arc Store** - may find Flatpak versions
2. **Use pkglayer** - `apt install x`, `yay -S x`, `nix-env -iA x`, etc. (your choice of distro)
3. **Use Homebrew** - `brew install x` (standalone, no Distrobox needed)

**For games:**

1. **Steam** - best Proton integration
2. **Heroic** - Epic Games Store, GOG
3. **Lutris** - community scripts for hard-to-run games

**For Windows software:**

1. **Arc Winapps** - pre-configured packages (Affinity v3, Battle.net)
2. **Lutris** - community Wine configurations
3. **Manual Distrobox + Wine** - full control for advanced users

**For web services:**

1. **Arc Store PWA wrapper** - install Netflix, WhatsApp, Claude, Figma, etc. as native apps

### Installation Success Rate by Type

- **Flatpak apps via Arc** - 95%+ (Flathub is mature and integrated)
- **Native packages via pkglayer** - 98%+ (apt, yay, nix, emerge comprehensive)
- **Web apps via PWA wrapper** - 99%+ (works with any website)
- **Pre-configured Windows apps** - 100% (Arc Winapps)
- **Games via Steam** - 85%+ (Proton coverage excellent)
- **Other Windows apps via Lutris** - 75-85% (community-maintained)
- **Homebrew CLI tools** - 95%+ (developer-focused)
