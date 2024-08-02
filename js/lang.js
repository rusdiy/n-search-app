const lang = {
    jp: {
        "hello": "こんにちは",
        "all": "すべて",
        "images": "画像",
        "pdf": "PDF",
        "videos": "ビデオ",
        "other": "その他",
        "popularWords": "最も検索された単語",
        "edit-metadata": "メタデータを編集",
        "close": "閉じる",
        "save": "変更を保存",
        "results-search": "検索結果",
        "of-search": "件中",
        "for-search": "件",
        "seconds": "秒",
        "no-results": "該当する情報はありません。"
    },
    en: {
        "hello": "Hello",
        "all": "All",
        "images": "Images",
        "pdf": "PDF",
        "videos": "Videos",
        "other": "Other",
        "popularWords": "Popular Words",
        "edit-metadata": "Edit Metadata",
        "close": "Close",
        "save": "Save Changes",
        "results-search": "Search Results",
        "of-search": "of",
        "for-search": "for",
        "seconds": "sec",
        "no-results": "No information was found matching."
    }
}

function getLang(selectedLanguage) {
    switch (selectedLanguage) {
        case 'jp':
            return lang.jp
        case 'en':
            return lang.en
        default:
            return lang.en
    }
}