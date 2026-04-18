# Content Import Schema (N3/N2/N1)

Use JSON arrays with these fields:

- `kana_items`: `script`, `kana`, `romaji`
- `vocab_items`: `term`, `reading`, `meaning`, `jlpt_level`, `tags[]`, `content_source_id`
- `kanji_items`: `character`, `onyomi`, `kunyomi`, `meaning`, `jlpt_level`, `content_source_id`
- `grammar_points`: `pattern`, `meaning`, `explanation`, `jlpt_level`, `content_source_id`
- `reading_passages`: `title`, `content`, `jlpt_level`, `questions[]`, `content_source_id`
- `listening_tracks`: `title`, `transcript`, `audio_url`, `jlpt_level`, `questions[]`, `content_source_id`

Provenance tables:

- `content_sources`: `source_name`, `source_url`, `license`, `retrieved_at`, `content_type`, `notes`
- `content_import_reports`: `content_type`, `total_records`, `accepted_records`, `missing_required`, `duplicate_collisions`, `by_level`, `report_payload`

Import preparation:

```bash
node scripts/import-content.mjs ./my-n3-vocab.json vocabulary "JMDict" "EDRDG Licence"
```

Quality gate checks are now automatic during import preparation:
- open-license whitelist validation
- missing-field / duplicate penalties
- quality score calculation (`0-100`)
- `qualityGatePassed` flag in the generated report
