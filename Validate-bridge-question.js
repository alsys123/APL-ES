
// ----------------- Bridge check functions only -----
      function extractHand(sentence) {
        // Regex: capture from ♠ through ♣, allowing honor cards and digits, stop before parentheses/punctuation
        const match = sentence.match(/♠[AKQJ0-9x]+ ♥[AKQJ0-9x]+ ♦[AKQJ0-9x]+ ♣[AKQJ0-9x]+/);
        return match ? match[0].trim() : null;
      }
