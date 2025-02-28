
var initialized = false;
let wordIPA = {}; // Global dictionary to store word-IPA pairs
let csvFilePath = "202502_de_dewikt.csv"; // Change this to the correct path

$.get(csvFilePath, function (csvData) {
    Papa.parse(csvData, {
        complete: function (results) {
            let data = results.data;

            data.forEach(row => {
                if (row.length >= 2) { // Ensure both word & IPA exist
                    let word = row[0].trim();
                    let ipa = row[1].trim();
                    wordIPA[word] = ipa; // Save to global dictionary
                }
            });

            console.log("CSV loaded"); // Debugging output
            initialized = true;
        }
    });
});

function filterBasicMatch(word, dictionary) {
    mainWord = word;
    lowerWord = word.toLowerCase()
    capWord = String(word.charAt(0).toUpperCase() + String(word).slice(1))

    if (typeof dictionary[word] != "undefined") {
        return word;
    }
    else if (typeof dictionary[lowerWord] != "undefined") {
        return lowerWord;
    }
    else if (typeof dictionary[capWord] != "undefined") {
        return capWord;
    }
    return false;

}

function findPartialMatches(word, dictionary) {

    let remainingWord = word;
    let ipaResult = "";

    basicMatch = filterBasicMatch(word, dictionary)
    if (basicMatch) {
        return { assembledWord: word, ipa: dictionary[basicMatch] };
    }

    // console.log("Finding partial")
    let foundParts = [];

    // Try to find partial matches from longest possible parts to shortest
    wordToCheck = remainingWord
    while (remainingWord.length > 0) {
        // console.log("remainingWord: " + remainingWord)
        let matched = false;

        basicMatch = filterBasicMatch(remainingWord, dictionary)
        // if (!dictionary.hasOwnProperty(remainingWord)) {
        if (!basicMatch) {
            remainingWord = remainingWord.slice(0, remainingWord.length - 1)
            continue;
        }

        // console.log("Match found: " + basicMatch)
        // If a match is found, add the IPA for that part and reduce the remaining word
        ipaResult += dictionary[basicMatch] + " ";  // Add IPA for matched part
        foundParts.push(basicMatch + " ");  // Store the matched part
        remainingWord = wordToCheck.slice(remainingWord.length);  // Remove the matched part from remaining word
        wordToCheck = remainingWord

        if (remainingWord.length == 0) {
            break;
        }
    }

    // If the entire word was assembled, return the result
    if (remainingWord === "") {
        return { assembledWord: foundParts.join(" "), ipa: ipaResult.trim() };
    } else {
        return { assembledWord: word, ipa: "undefined" };  // Couldn't assemble the word
    }
}

function doTranslation() {
    if (!initialized) {
        return;
    }
    txt = $("#givenText").val();
    txt = txt.replace(/[^a-zA-ZüöäÜÖÄß ]/g, '');
    words = txt.split(' ');

    resObj = $("#parsedText");
    resObj.empty()


    words.forEach(word => {
        if (word !== "") {
            res = findPartialMatches(word, wordIPA)
            let div = $(`
            <div class="ipaContainer">
                <div class="IPA">${res['ipa']}</div>
                <div class="WORD">${res['assembledWord']}</div>
            </div>
        `);
            resObj.append(div); // Append to body or any container

        }
    });

    // resEn = translateToEnglish(txt);
    // console.log(resEn);
}

function search(ele) {
    if (event.key === 'Enter') {
        doTranslation()
    }
}

$(document).ready(function () {
    $("#btnTranslate").click(doTranslation);
});