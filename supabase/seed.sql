insert into jlpt_levels(code, sort_order) values
('N5', 1), ('N4', 2), ('N3', 3), ('N2', 4), ('N1', 5)
on conflict (code) do nothing;

insert into content_sources(source_name, source_url, license, content_type, notes) values
('Tatoeba Japanese Sentences','https://tatoeba.org','CC BY 2.0 FR','reading','Curated short reading/listening transcripts derived from open corpus'),
('JMDict','https://www.edrdg.org/jmdict/j_jmdict.html','EDRDG Licence','vocabulary','Vocabulary metadata normalized for study use'),
('KANJIDIC2','https://www.edrdg.org/kanjidic/kanjd2index.html','EDRDG Licence','kanji','Kanji readings and meanings'),
('Open Japanese Grammar Patterns (project-authored)','https://github.com/imnothoan/Japanese-N1','CC BY 4.0','grammar','Project-authored grammar explanations with open attribution'),
('Project-authored Kana Set','https://github.com/imnothoan/Japanese-N1','CC0-1.0','kana','Hiragana/Katakana foundational set')
on conflict do nothing;

insert into kana_items(script, kana, romaji) values
('hiragana','あ','a'),('hiragana','い','i'),('hiragana','う','u'),('hiragana','え','e'),('hiragana','お','o'),
('hiragana','か','ka'),('hiragana','き','ki'),('hiragana','く','ku'),('hiragana','け','ke'),('hiragana','こ','ko'),
('hiragana','さ','sa'),('hiragana','し','shi'),('hiragana','す','su'),('hiragana','せ','se'),('hiragana','そ','so'),
('hiragana','た','ta'),('hiragana','ち','chi'),('hiragana','つ','tsu'),('hiragana','て','te'),('hiragana','と','to'),
('hiragana','な','na'),('hiragana','に','ni'),('hiragana','ぬ','nu'),('hiragana','ね','ne'),('hiragana','の','no'),
('hiragana','は','ha'),('hiragana','ひ','hi'),('hiragana','ふ','fu'),('hiragana','へ','he'),('hiragana','ほ','ho'),
('hiragana','ま','ma'),('hiragana','み','mi'),('hiragana','む','mu'),('hiragana','め','me'),('hiragana','も','mo'),
('hiragana','や','ya'),('hiragana','ゆ','yu'),('hiragana','よ','yo'),
('hiragana','ら','ra'),('hiragana','り','ri'),('hiragana','る','ru'),('hiragana','れ','re'),('hiragana','ろ','ro'),
('hiragana','わ','wa'),('hiragana','を','wo'),('hiragana','ん','n'),
('katakana','ア','a'),('katakana','イ','i'),('katakana','ウ','u'),('katakana','エ','e'),('katakana','オ','o'),
('katakana','カ','ka'),('katakana','キ','ki'),('katakana','ク','ku'),('katakana','ケ','ke'),('katakana','コ','ko'),
('katakana','サ','sa'),('katakana','シ','shi'),('katakana','ス','su'),('katakana','セ','se'),('katakana','ソ','so'),
('katakana','タ','ta'),('katakana','チ','chi'),('katakana','ツ','tsu'),('katakana','テ','te'),('katakana','ト','to'),
('katakana','ナ','na'),('katakana','ニ','ni'),('katakana','ヌ','nu'),('katakana','ネ','ne'),('katakana','ノ','no'),
('katakana','ハ','ha'),('katakana','ヒ','hi'),('katakana','フ','fu'),('katakana','ヘ','he'),('katakana','ホ','ho'),
('katakana','マ','ma'),('katakana','ミ','mi'),('katakana','ム','mu'),('katakana','メ','me'),('katakana','モ','mo'),
('katakana','ヤ','ya'),('katakana','ユ','yu'),('katakana','ヨ','yo'),
('katakana','ラ','ra'),('katakana','リ','ri'),('katakana','ル','ru'),('katakana','レ','re'),('katakana','ロ','ro'),
('katakana','ワ','wa'),('katakana','ヲ','wo'),('katakana','ン','n')
on conflict (script, kana) do nothing;

insert into vocab_items(term, reading, meaning, jlpt_level, tags, content_source_id) values
('学生','がくせい','student','N5',array['school'],(select id from content_sources where source_name='JMDict' limit 1)),
('先生','せんせい','teacher','N5',array['school'],(select id from content_sources where source_name='JMDict' limit 1)),
('図書館','としょかん','library','N4',array['place'],(select id from content_sources where source_name='JMDict' limit 1)),
('経験','けいけん','experience','N4',array['abstract'],(select id from content_sources where source_name='JMDict' limit 1)),
('理由','りゆう','reason','N3',array['abstract'],(select id from content_sources where source_name='JMDict' limit 1)),
('準備','じゅんび','preparation','N3',array['daily'],(select id from content_sources where source_name='JMDict' limit 1)),
('調査','ちょうさ','investigation','N2',array['work'],(select id from content_sources where source_name='JMDict' limit 1)),
('傾向','けいこう','tendency','N2',array['analysis'],(select id from content_sources where source_name='JMDict' limit 1)),
('顕著','けんちょ','remarkable','N1',array['academic'],(select id from content_sources where source_name='JMDict' limit 1)),
('遂行','すいこう','accomplishment/execution','N1',array['business'],(select id from content_sources where source_name='JMDict' limit 1))
on conflict do nothing;

insert into kanji_items(character, onyomi, kunyomi, meaning, jlpt_level, content_source_id) values
('日','ニチ,ジツ','ひ,か','day/sun','N5',(select id from content_sources where source_name='KANJIDIC2' limit 1)),
('学','ガク','まな.ぶ','study','N5',(select id from content_sources where source_name='KANJIDIC2' limit 1)),
('読','ドク','よ.む','read','N4',(select id from content_sources where source_name='KANJIDIC2' limit 1)),
('強','キョウ','つよ.い','strong','N4',(select id from content_sources where source_name='KANJIDIC2' limit 1)),
('準','ジュン','じゅん.じる','standard/prepare','N3',(select id from content_sources where source_name='KANJIDIC2' limit 1)),
('査','サ','しら.べる','investigate','N2',(select id from content_sources where source_name='KANJIDIC2' limit 1)),
('傾','ケイ','かたむ.く','lean/incline','N2',(select id from content_sources where source_name='KANJIDIC2' limit 1)),
('顕','ケン','あらわ.れる','appear/manifest','N1',(select id from content_sources where source_name='KANJIDIC2' limit 1)),
('遂','スイ','と.げる','accomplish','N1',(select id from content_sources where source_name='KANJIDIC2' limit 1))
on conflict (character) do nothing;

insert into grammar_points(pattern, meaning, explanation, jlpt_level, content_source_id) values
('〜です','to be','Basic copula used in polite speech.','N5',(select id from content_sources where source_name='Open Japanese Grammar Patterns (project-authored)' limit 1)),
('〜ます','polite verb ending','Used for polite present/future forms.','N5',(select id from content_sources where source_name='Open Japanese Grammar Patterns (project-authored)' limit 1)),
('〜ながら','while doing','Expresses two simultaneous actions.','N4',(select id from content_sources where source_name='Open Japanese Grammar Patterns (project-authored)' limit 1)),
('〜ように','so that/in order to','Expresses purpose or desired state.','N4',(select id from content_sources where source_name='Open Japanese Grammar Patterns (project-authored)' limit 1)),
('〜ことになる','it has been decided that','Resulting decision or arrangement.','N3',(select id from content_sources where source_name='Open Japanese Grammar Patterns (project-authored)' limit 1)),
('〜に違いない','must be / no doubt','Strong speaker conviction.','N2',(select id from content_sources where source_name='Open Japanese Grammar Patterns (project-authored)' limit 1)),
('〜ずにはいられない','cannot help but','Action is unavoidable due to emotion/urge.','N1',(select id from content_sources where source_name='Open Japanese Grammar Patterns (project-authored)' limit 1))
on conflict do nothing;

insert into reading_passages(title, content, jlpt_level, questions, content_source_id) values
('自己紹介','わたしは田中です。日本語を勉強しています。','N5','[{"question":"誰が日本語を勉強していますか？","options":["田中","先生","学生"],"answer":"田中"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('図書館で','図書館で本を借りて、家で読みました。','N4','[{"question":"どこで本を借りましたか？","options":["学校","図書館","店"],"answer":"図書館"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('地域イベント','町では毎月、地域の清掃活動が行われています。参加者は朝七時に集合し、担当区域を決めてから作業します。','N3','[{"question":"参加者は何時に集合しますか？","options":["6時","7時","8時"],"answer":"7時"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('市場調査レポート','新商品の販売前に、消費者の購買傾向を分析した。価格よりも使いやすさを重視する回答が多かった。','N2','[{"question":"回答で重視された点は何ですか？","options":["価格","使いやすさ","広告"],"answer":"使いやすさ"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('政策討論','討論では、短期的な成果だけでなく、長期的な社会的影響をどう評価するかが主要な論点となった。','N1','[{"question":"主要な論点は何ですか？","options":["予算の増額","長期的な社会的影響の評価","参加人数"],"answer":"長期的な社会的影響の評価"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1))
on conflict do nothing;

insert into listening_tracks(title, transcript, jlpt_level, questions, content_source_id) values
('朝の会話','A: おはよう。B: おはよう。今日は早いですね。','N5','[{"question":"二人は何について話していますか？","options":["朝","夜","雨"],"answer":"朝"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('週末の予定','A: 土曜日は映画を見ます。B: いいですね。','N4','[{"question":"土曜日に何をしますか？","options":["映画","買い物","仕事"],"answer":"映画"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('職場の連絡','A: 明日の会議は九時開始です。資料は今夜までに共有してください。B: 承知しました。','N3','[{"question":"資料はいつまでに共有しますか？","options":["今夜まで","明日の朝","来週"],"answer":"今夜まで"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('駅での案内放送','放送: 本日の最終電車は二十三時四十五分発です。三番ホームへお急ぎください。','N3','[{"question":"最終電車の発車時刻は？","options":["23:15","23:45","00:15"],"answer":"23:45"},{"question":"乗客はどこへ向かいますか？","options":["一番ホーム","三番ホーム","改札口"],"answer":"三番ホーム"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('病院予約の電話','A: 予約は来週火曜日の午後二時です。保険証を忘れずにお持ちください。B: わかりました。','N3','[{"question":"予約はいつですか？","options":["来週火曜日14時","今週火曜日14時","来週水曜日14時"],"answer":"来週火曜日14時"},{"question":"持っていく必要があるものは？","options":["現金","保険証","診断書"],"answer":"保険証"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('研究発表準備','A: 発表では結論だけでなく、調査方法も説明してください。B: はい、図表を追加してわかりやすくします。','N2','[{"question":"Bは何を追加すると言いましたか？","options":["音声","図表","脚注"],"answer":"図表"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('採用面接の確認','A: 面接はオンラインで実施します。開始十分前に接続確認をしてください。B: 承知しました。','N2','[{"question":"面接形式は？","options":["対面","オンライン","電話"],"answer":"オンライン"},{"question":"接続確認はいつですか？","options":["開始10分前","開始30分前","開始後"],"answer":"開始10分前"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('企画会議の議論','A: 予算削減の中でも、顧客対応の品質は維持すべきです。B: そのために研修の内容を見直しましょう。','N2','[{"question":"維持すべきものは？","options":["広告費","顧客対応の品質","会議回数"],"answer":"顧客対応の品質"},{"question":"見直す対象は？","options":["採用人数","研修内容","販売価格"],"answer":"研修内容"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('公共政策インタビュー','A: 政策の有効性は短期指標だけで測れません。B: では、どのような長期指標が必要ですか。','N1','[{"question":"Aの主張は何ですか？","options":["短期指標だけで十分","短期指標だけでは不十分","長期指標は不要"],"answer":"短期指標だけでは不十分"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('経済番組の討論','司会: 物価上昇局面で賃上げが追いつかない場合、実質所得の低下が消費行動に与える影響をどう見るべきでしょうか。','N1','[{"question":"論点は何ですか？","options":["輸出拡大","実質所得低下が消費に与える影響","観光需要の回復"],"answer":"実質所得低下が消費に与える影響"},{"question":"前提となる状況は？","options":["物価下落","賃上げが追いつかない物価上昇","円高進行"],"answer":"賃上げが追いつかない物価上昇"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1)),
('学術講演の要旨','講師: 本研究は因果推論の限界を踏まえ、観察データの偏りを補正する新規手法を提案する。','N1','[{"question":"講演の主題は？","options":["実験装置の開発","観察データの偏り補正手法","教育制度改革"],"answer":"観察データの偏り補正手法"},{"question":"研究が踏まえるものは？","options":["倫理審査","因果推論の限界","統計ソフトの更新"],"answer":"因果推論の限界"}]'::jsonb,(select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1))
on conflict do nothing;

insert into quiz_templates(module, jlpt_level, title, timed_seconds, questions) values
('vocabulary','N5','N5 Vocabulary Starter',300,'[{"id":"q1","prompt":"学生 の意味は？","options":["teacher","student","library"],"answer":"student"},{"id":"q2","prompt":"先生 の意味は？","options":["teacher","doctor","classroom"],"answer":"teacher"},{"id":"q3","prompt":"図書館 の意味は？","options":["station","library","restaurant"],"answer":"library"}]'::jsonb),
('grammar','N4','N4 Grammar Basics',420,'[{"id":"q1","prompt":"同時進行を表す文法は？","options":["〜ながら","〜ように","〜です"],"answer":"〜ながら"},{"id":"q2","prompt":"目的を表す文法は？","options":["〜ように","〜ずにはいられない","〜だけ"],"answer":"〜ように"},{"id":"q3","prompt":"丁寧な文末は？","options":["〜ます","〜べき","〜まい"],"answer":"〜ます"}]'::jsonb),
('reading','N3','N3 Reading Skills',600,'[{"id":"q1","prompt":"集合時間は？","options":["6時","7時","8時"],"answer":"7時"},{"id":"q2","prompt":"担当区域を決めるのはいつですか？","options":["集合前","作業前","作業後"],"answer":"作業前"},{"id":"q3","prompt":"活動頻度は？","options":["毎週","毎月","毎年"],"answer":"毎月"}]'::jsonb),
('reading','N3','N3 Reading Progress Check',660,'[{"id":"q1","prompt":"会議の開始は何時ですか？","options":["9時","10時","11時"],"answer":"9時"},{"id":"q2","prompt":"提出期限は？","options":["今夜","明日","来週"],"answer":"今夜"},{"id":"q3","prompt":"連絡先は誰ですか？","options":["部長","人事","受付"],"answer":"部長"}]'::jsonb),
('listening','N2','N2 Listening Focus',600,'[{"id":"q1","prompt":"何を追加しますか？","options":["図表","写真","録音"],"answer":"図表"},{"id":"q2","prompt":"面接形式は？","options":["オンライン","対面","電話"],"answer":"オンライン"},{"id":"q3","prompt":"接続確認はいつ？","options":["開始10分前","開始後","前日"],"answer":"開始10分前"}]'::jsonb),
('listening','N2','N2 Strategy Listening',720,'[{"id":"q1","prompt":"維持すべきものは？","options":["顧客対応の品質","広告量","会議時間"],"answer":"顧客対応の品質"},{"id":"q2","prompt":"見直す対象は？","options":["研修内容","販売価格","契約書"],"answer":"研修内容"},{"id":"q3","prompt":"発言の目的は？","options":["業務停止","品質維持","人員削減"],"answer":"品質維持"}]'::jsonb),
('grammar','N1','N1 Advanced Grammar',720,'[{"id":"q1","prompt":"「〜ずにはいられない」の意味として最も近いものは？","options":["必ず成功する","どうしても〜してしまう","許可されている"],"answer":"どうしても〜してしまう"},{"id":"q2","prompt":"「〜に違いない」が示すのは？","options":["弱い推量","強い確信","禁止"],"answer":"強い確信"},{"id":"q3","prompt":"「〜ことになる」は？","options":["偶然","決定事項","希望"],"answer":"決定事項"}]'::jsonb),
('reading','N1','N1 Critical Reading',840,'[{"id":"q1","prompt":"討論の主要論点は？","options":["短期成果のみ","長期的社会影響の評価","予算増額"],"answer":"長期的社会影響の評価"},{"id":"q2","prompt":"講演で提案されたものは？","options":["新規補正手法","新教材","新規税制"],"answer":"新規補正手法"},{"id":"q3","prompt":"前提として挙げられた限界は？","options":["因果推論の限界","翻訳精度","通信速度"],"answer":"因果推論の限界"}]'::jsonb)
on conflict do nothing;

insert into mock_tests(title, level, sections, duration_seconds) values
('JLPT N5 Mini Mock','N5','[{"name":"Language Knowledge","questions":10},{"name":"Reading","questions":5},{"name":"Listening","questions":5}]'::jsonb,3600),
('JLPT N4 Mini Mock','N4','[{"name":"Language Knowledge","questions":12},{"name":"Reading","questions":6},{"name":"Listening","questions":6}]'::jsonb,4200),
('JLPT N3 Timed Mock','N3','[{"name":"Language Knowledge","questions":20,"duration_seconds":1800},{"name":"Reading","questions":10,"duration_seconds":2100},{"name":"Listening","questions":10,"duration_seconds":1800}]'::jsonb,5700),
('JLPT N2 Timed Mock','N2','[{"name":"Language Knowledge","questions":25,"duration_seconds":2100},{"name":"Reading","questions":12,"duration_seconds":2400},{"name":"Listening","questions":12,"duration_seconds":1800}]'::jsonb,6300),
('JLPT N1 Timed Mock','N1','[{"name":"Language Knowledge","questions":30,"duration_seconds":2400},{"name":"Reading","questions":14,"duration_seconds":2700},{"name":"Listening","questions":12,"duration_seconds":1800}]'::jsonb,6900)
on conflict do nothing;

insert into content_import_reports(source_id, content_type, total_records, accepted_records, missing_required, duplicate_collisions, by_level, report_payload) values
((select id from content_sources where source_name='Project-authored Kana Set' limit 1),'kana',4,4,0,0,'{}'::jsonb,'{"note":"seeded from data/raw/kana.json"}'::jsonb),
((select id from content_sources where source_name='JMDict' limit 1),'vocabulary',3,3,0,0,'{"N3":1,"N2":1,"N1":1}'::jsonb,'{"note":"seeded from data/raw/vocabulary.json"}'::jsonb),
((select id from content_sources where source_name='KANJIDIC2' limit 1),'kanji',3,3,0,0,'{"N3":1,"N2":1,"N1":1}'::jsonb,'{"note":"seeded from data/raw/kanji.json"}'::jsonb),
((select id from content_sources where source_name='Open Japanese Grammar Patterns (project-authored)' limit 1),'grammar',3,3,0,0,'{"N3":1,"N2":1,"N1":1}'::jsonb,'{"note":"seeded from data/raw/grammar.json"}'::jsonb),
((select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1),'reading',3,3,0,0,'{"N3":1,"N2":1,"N1":1}'::jsonb,'{"note":"seeded from data/raw/reading.json"}'::jsonb),
((select id from content_sources where source_name='Tatoeba Japanese Sentences' limit 1),'listening',3,3,0,0,'{"N3":1,"N2":1,"N1":1}'::jsonb,'{"note":"seeded from data/raw/listening.json"}'::jsonb)
on conflict do nothing;
