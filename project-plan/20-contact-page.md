# 20 — Contact Us

## Layout
- Left / start — quick copy: invitation to write, typical reply time,
  email address and a link to an Instagram handle (placeholder).
- Right / end — the form.

## Form
| Field    | Type                       | Required |
|----------|----------------------------|----------|
| Name     | text                       | yes      |
| Email    | email                      | yes      |
| Subject  | text (max 200)             | no       |
| Message  | textarea (10–2000 chars)   | yes      |

All labels + placeholders + errors come from translation keys.

## Submission
POST to `/api/contact/`. Loading state disables the form and swaps CTA text.
On success, the form is replaced by a success block that thanks the user and
lets them send another message.

Validation errors from the server are merged into field errors.

## Rate limiting
Server enforces IP throttle (see step 05). UI surfaces a friendly message on
429 ("You've sent a few messages recently — try again in a minute.").
