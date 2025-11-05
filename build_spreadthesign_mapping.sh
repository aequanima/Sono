#!/bin/bash

# SpreadTheSign ID mapper
# Fetches word IDs from SpreadTheSign with rate limiting

OUTPUT_FILE="spreadthesign_words.json"
TEMP_FILE="/tmp/sts_temp.html"

# Word list
words=(
"not" "no" "want" "go" "more" "it" "that" "like" "help" "in"
"on" "up" "stop" "you" "yes" "yeah" "a" "the" "is" "finished"
"all" "done" "what" "mine" "my" "get" "make" "look" "different" "do"
"put" "turn" "open" "big" "little" "good" "some" "here" "out" "off"
"down" "she" "he" "who" "where" "when" "can" "play" "eat" "drink"
"me" "need" "this" "and" "but" "because" "with" "will" "say" "tell"
"think" "know" "see" "come" "give" "take" "always" "very" "fast" "slow"
"happy" "sad" "bad" "same" "away" "over" "under" "other" "why" "how"
"then" "now" "later" "we" "they" "feel" "work" "read" "again" "don't"
"are" "was" "have" "for" "of" "to" "close" "question" "listen" "home"
"time" "friend" "fun" "mom" "dad" "baby" "milk" "water" "juice" "food"
"snack" "cup" "spoon" "bowl" "toy" "ball" "book" "car" "dog" "cat"
"bed" "chair" "house" "shoes" "hat" "coat" "diaper" "potty" "bath" "brush"
"tv" "phone" "music" "outside" "park" "school" "night" "morning" "sun" "moon"
"animal" "color" "block" "song" "doll" "blanket" "pillow" "crib" "light"
)

echo "[" > "$OUTPUT_FILE"
first=true

for word in "${words[@]}"; do
    echo "Fetching: $word"
    
    # Sleep between requests (3-5 seconds)
    sleep $((3 + RANDOM % 3))
    
    # Fetch search results
    curl --limit-rate 50k \
         --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" \
         -s "https://spreadthesign.com/en.us/search/?q=$word" \
         -o "$TEMP_FILE" 2>/dev/null
    
    # Extract word ID (first match)
    word_id=$(grep -o "word/[0-9]*/$word" "$TEMP_FILE" | head -1 | grep -o '[0-9]*')
    
    if [ -n "$word_id" ]; then
        if [ "$first" = false ]; then
            echo "," >> "$OUTPUT_FILE"
        fi
        first=false
        
        echo "  {" >> "$OUTPUT_FILE"
        echo "    \"word\": \"$word\"," >> "$OUTPUT_FILE"
        echo "    \"id\": $word_id," >> "$OUTPUT_FILE"
        echo "    \"source\": \"spreadthesign\"" >> "$OUTPUT_FILE"
        echo -n "  }" >> "$OUTPUT_FILE"
        
        echo "  ✓ $word -> $word_id"
    else
        echo "  ✗ $word (not found)"
    fi
done

echo "" >> "$OUTPUT_FILE"
echo "]" >> "$OUTPUT_FILE"

echo ""
echo "Mapping saved to: $OUTPUT_FILE"
echo "Total words processed: ${#words[@]}"
