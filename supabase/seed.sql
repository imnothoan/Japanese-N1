insert into jlpt_levels(code, sort_order) values
('N5', 1), ('N4', 2), ('N3', 3), ('N2', 4), ('N1', 5)
on conflict (code) do nothing;

insert into vocab_items(term, reading, meaning, jlpt_level, tags) values
('学生','がくせい','student','N5',array['school']),
('先生','せんせい','teacher','N5',array['school']),
('図書館','としょかん','library','N4',array['place']),
('経験','けいけん','experience','N4',array['abstract'])
on conflict do nothing;

insert into kanji_items(character, onyomi, kunyomi, meaning, jlpt_level) values
('日','ニチ,ジツ','ひ,か','day/sun','N5'),
('学','ガク','まな.ぶ','study','N5'),
('読','ドク','よ.む','read','N4'),
('強','キョウ','つよ.い','strong','N4')
on conflict (character) do nothing;

insert into grammar_points(pattern, meaning, explanation, jlpt_level) values
('〜です','to be','Basic copula used in polite speech.','N5'),
('〜ます','polite verb ending','Used for polite present/future forms.','N5'),
('〜ながら','while doing','Expresses two simultaneous actions.','N4'),
('〜ように','so that/in order to','Expresses purpose or desired state.','N4')
on conflict do nothing;

insert into reading_passages(title, content, jlpt_level, questions) values
('自己紹介','わたしは田中です。日本語を勉強しています。','N5','[{"question":"誰が日本語を勉強していますか？","options":["田中","先生","学生"],"answer":"田中"}]'::jsonb),
('図書館で','図書館で本を借りて、家で読みました。','N4','[{"question":"どこで本を借りましたか？","options":["学校","図書館","店"],"answer":"図書館"}]'::jsonb)
on conflict do nothing;

insert into listening_tracks(title, transcript, jlpt_level, questions) values
('朝の会話','A: おはよう。B: おはよう。今日は早いですね。','N5','[{"question":"二人は何について話していますか？","options":["朝","夜","雨"],"answer":"朝"}]'::jsonb),
('週末の予定','A: 土曜日は映画を見ます。B: いいですね。','N4','[{"question":"土曜日に何をしますか？","options":["映画","買い物","仕事"],"answer":"映画"}]'::jsonb)
on conflict do nothing;

insert into quiz_templates(module, jlpt_level, title, timed_seconds, questions) values
('vocabulary','N5','N5 Vocabulary Starter',300,'[{"id":"q1","prompt":"学生 の意味は？","options":["teacher","student","library"],"answer":"student"}]'::jsonb),
('grammar','N4','N4 Grammar Basics',420,'[{"id":"q1","prompt":"同時進行を表す文法は？","options":["〜ながら","〜ように","〜です"],"answer":"〜ながら"}]'::jsonb)
on conflict do nothing;

insert into mock_tests(title, level, sections, duration_seconds) values
('JLPT N5 Mini Mock','N5','[{"name":"Language Knowledge","questions":10},{"name":"Reading","questions":5},{"name":"Listening","questions":5}]'::jsonb,3600),
('JLPT N4 Mini Mock','N4','[{"name":"Language Knowledge","questions":12},{"name":"Reading","questions":6},{"name":"Listening","questions":6}]'::jsonb,4200)
on conflict do nothing;
