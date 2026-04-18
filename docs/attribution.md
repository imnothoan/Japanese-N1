# Attribution

All imported or curated study content must be traceable through `content_sources`.

| Source | URL | License | Modules | Notes |
|---|---|---|---|---|
| Tatoeba Japanese Sentences | https://tatoeba.org | CC BY 2.0 FR | Reading, Listening transcripts | Use attribution and preserve source IDs where possible. |
| JMDict | https://www.edrdg.org/jmdict/j_jmdict.html | EDRDG Licence | Vocabulary | Keep EDRDG notice in downstream distributions. |
| KANJIDIC2 | https://www.edrdg.org/kanjidic/kanjd2index.html | EDRDG Licence | Kanji | Keep EDRDG notice in downstream distributions. |
| Wikimedia Commons Japanese Audio | https://commons.wikimedia.org | CC BY-SA (asset specific) | Listening links | Verify per-asset license before linking. |
| Project-authored Grammar and Kana | https://github.com/imnothoan/Japanese-N1 | CC BY 4.0 / CC0 | Grammar, Kana | Native authored examples and kana chart seed. |

## Provenance process

1. Register source in `content_sources`.
2. Run `node scripts/import-content.mjs <file.json> <content-type> <source-name>`.
3. Persist validation stats in `content_import_reports`.
4. Import normalized NDJSON into the target module table with `content_source_id`.
