# Content Import Schema (N3/N2/N1)

Use JSON arrays with these fields:

- `vocab_items`: `term`, `reading`, `meaning`, `jlpt_level`, `tags[]`
- `kanji_items`: `character`, `onyomi`, `kunyomi`, `meaning`, `jlpt_level`
- `grammar_points`: `pattern`, `meaning`, `explanation`, `jlpt_level`
- `reading_passages`: `title`, `content`, `jlpt_level`, `questions[]`
- `listening_tracks`: `title`, `transcript`, `audio_url`, `jlpt_level`, `questions[]`

Import preparation:

```bash
node scripts/import-content.mjs ./my-n3-vocab.json vocab_items
```
