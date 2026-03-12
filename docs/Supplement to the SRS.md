# Personal Project | Stage #2

The second stage of the project builds upon Stage #1, adding a new domain entity and a read-only AI experience that helps users explore their events faster.

Introduce a new entity – **Tags** – and link them to events.

In Stage #1, events had no semantic grouping. Now the application must support multi-tag classification and tag-based discovery. This affects create/edit forms, listing, calendar rendering, and query capabilities.

**Functional Requirements**

* **Tagging on Create/Edit**
  * Event form includes a multi-select "Tags" control (e.g., *Tech, Art, Business, Music*).
  * At least one tag is optional; maximum 5 tags per event.

* **Display**
  * Events List shows tags as compact chips.
  * Event Details shows all tags.
  * My Events (Calendar) colors events by the first tag.

* **Filtering**
  * On the Events page, add a Tag filter (multi-select).
  * Empty state if no results: "No events match the selected tags."

* **Validation & Rules**
  * Tag names are unique (case-insensitive), stored lowercase.
  * Only organizers can modify tags on their events.

## AI Assistant

Introduce a simple AI Assistant that answers natural-language questions about events using read-only access. The assistant must not create, edit, or delete any data.

The assistant should be able to answer questions like:

* "What events am I attending this week?"
* "When is my next event?"
* "List all events I organize."
* "Show public tech events this weekend." (uses tag filtering)
* "Who's attending the Marketing Meetup?"
* "Where is the Design Sprint?"

*Hint: To answer questions, the assistant should receive the user's query and a compact snapshot of relevant data (e.g., the user's upcoming events, selected public events, tags). Include that data in the prompt so the model can generate a precise response based on current context.*

To power your assistant, use the **Groq API** – [https://console.groq.com](https://console.groq.com). It offers a free tier, simple authentication, high performance, and an OpenAI-compatible endpoint.

Recommended model: **`openai/gpt-oss-20b`** — production-ready, ~1000 t/s, cost-efficient ($0.075/$0.30 per 1M tokens), 131k context window. Sufficient for JSON snapshots of up to 50 events.

### Functional Requirements

The "AI Assistant" section should contain a text input field where the user can type a question.
On submission:

* The assistant should analyze the question.
* It should receive a compact JSON snapshot of the user's events and up to 50 public events (ordered by date) from the database.
* It should return a relevant, concise answer displayed in a chat-like interface below the input.

The assistant must support:

* Counting all user's events
* Listing upcoming events
* Showing events for a specific day or date range
* Listing past events (e.g., previous week)
* Filtering events by tag (e.g., "show my tech events")
* Showing participants for a specific event

If the question is unclear or unsupported, return a fallback message:
"Sorry, I didn't understand that. Please try rephrasing your question."

## Frontend Enhancements

* **Zustand** — already implemented in Stage #1 (auth + events stores). Requirement satisfied.
* **Storybook** — extract the existing React components into the [Storybook library](https://storybook.js.org/tutorials/intro-to-storybook/react/en/get-started/). Components to cover: Button, Input, Badge, Card, Dialog, Spinner, EmptyState, EventCard, TagMultiSelect, ConfirmModal.

It is recommended to create a separate branch (`feature/storybook`) for the Storybook task.