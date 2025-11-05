#\!/bin/bash
OUTPUT_FILE="spreadthesign_words.json"
TEMP_FILE="/tmp/sts_temp.html"
words=("not" "want" "go" "more" "help" "stop" "yes" "good" "play" "eat")

echo "[" > "$OUTPUT_FILE"
first=true

for word in "${words[@]}"; do
    echo "Fetching: $word"
    sleep 3
    curl --limit-rate 50k --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" -s "https://spreadthesign.com/en.us/search/?q=$word" -o "$TEMP_FILE" 2>/dev/null
    word_id=$(grep -o "word/[0-9]*/$word" "$TEMP_FILE" | head -1 | grep -o '[0-9]*')
    
    if [ -n "$word_id" ]; then
        if [ "$first" = false ]; then
            echo "," >> "$OUTPUT_FILE"
        fi
        first=false
        echo "  {\"word\": \"$word\", \"id\": $word_id, \"source\": \"spreadthesign\"}" | tr '\n' ' ' >> "$OUTPUT_FILE"
        echo "  ✓ $word -> $word_id"
    else
        echo "  ✗ $word (not found)"
    fi
done

echo "" >> "$OUTPUT_FILE"
echo "]" >> "$OUTPUT_FILE"
echo "Done\!"
