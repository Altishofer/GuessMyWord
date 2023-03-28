import nltk
import requests
import json

def ranking(word_to_search_for):
    word_to_search_for = "result" # <----------- noch löschen
    url = f"https://wordsapiv1.p.rapidapi.com/words/{word_to_search_for}"

    headers = {
        'X-RapidAPI-Key': '382102422cmshf0f6394b2011b79p18585bjsn297072bb9584',
        'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
    }

    response = requests.request("GET", url, headers=headers)
    json_data = json.loads(response.text)


    # Define a mapping of part-of-speech tags to their relative importance
    tag_importance = {
        'NN': 5,  # Noun, singular or mass
        'NNS': 5,  # Noun, plural
        'NNP': 7,  # Proper noun, singular
        'NNPS': 7,  # Proper noun, plural
        'VB': 3,  # Verb, base form
        'VBD': 3,  # Verb, past tense
        'VBG': 3,  # Verb, gerund or present participle
        'VBN': 3,  # Verb, past participle
        'VBP': 3,  # Verb, non-3rd person singular present
        'VBZ': 3,  # Verb, 3rd person singular present
        'JJ': 2,  # Adjective
        'JJR': 2,  # Adjective, comparative
        'JJS': 2,  # Adjective, superlative
        'RB': 1,  # Adverb
        'RBR': 1,  # Adverb, comparative
        'RBS': 1,  # Adverb, superlative
        'IN': 1,  # Preposition or subordinating conjunction
        'CC': 1,  # Coordinating conjunction
        'PRP': 1,  # Personal pronoun
        'PRP$': 1,  # Possessive pronoun
        'WP': 1,  # Wh-pronoun
        'WP$': 1,  # Possessive wh-pronoun
    }


    example_sentences = []
    importance_sentences = {}
    m = 0

    for n, example in enumerate(json_data["results"]):
        try:
            sentence = example["examples"][0]
            example_sentences.append(sentence)

            tokens = nltk.word_tokenize(sentence)
            pos_tokens = [nltk.pos_tag(tokens)]
            tag_freq = nltk.FreqDist(tag for word in pos_tokens for (word, tag) in word)
            sent_scores = [sum(tag_importance.get(tag, 0) for (word, tag) in sent) for sent in pos_tokens][0]

            importance_sentences[sentence] = sent_scores

            print(sent_scores)
            m += 1
        except KeyError:
            pass

    return importance_sentences