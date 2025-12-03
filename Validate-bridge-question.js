
// ----------------- Bridge check functions only -----
      function extractHand(sentence) {
        // Regex: capture from ♠ through ♣, allowing honor cards and digits, stop before parentheses/punctuation
        const match = sentence.match(/♠[AKQJ0-9x]+ ♥[AKQJ0-9x]+ ♦[AKQJ0-9x]+ ♣[AKQJ0-9x]+/);
        return match ? match[0].trim() : null;
      }

// special check the texdt field for bridge question accuracy
      function checkMyText(inputText) {
        const origText = inputText;
        //  if (inputText.includes("HCP")) {
        //    inputText = inputText + " *** ERROR CHECK *** has HCP VALUE";
        //  }

        // check length of hand
        const hand = extractHand(inputText);
        if (hand && hand.length < 20) {
          inputText = inputText + "⚠️" + "ERROR Less than 13 Cards";
        }
        if (hand && hand.length > 20) {
          inputText = inputText + "⚠️" + "ERROR More than 13 Cards";
        }

        // now if the text contains "HCP", get the number of points and count to verify honors
        const HCPMatch = auditQuestion(origText);
        if (HCPMatch) {
          inputText = inputText + "⚠️" + "HCP Don't match actual of:  " + HCPMatch;
        }

        return inputText;
      }
      // Utility: count HCP from a hand string
      function countHCP(hand) {
        const values = { 'A': 4, 'K': 3, 'Q': 2, 'J': 1 };
        let total = 0;
        // Match all honor letters in the hand
        const honors = hand.match(/[AKQJ]/g) || [];
        honors.forEach(h => total += values[h]);
        return total;
      }

      function extractClaimedHCP(text) {
        // Flexible regex: matches "13 HCP" or "HCP = 13"
        const match = text.match(/(\d+)\s*HCP|HCP\s*=?\s*(\d+)/i);
        if (!match) return null;
        return match[1] ? Number(match[1]) : Number(match[2]);
      }

      // Audit a single question text
      function auditQuestion(questionText) {
        const claimed = extractClaimedHCP(questionText);
        if (!claimed) return null;

        const handMatch = questionText.match(/♠[^♥♦♣]+ ♥[^♦♣]+ ♦[^♣]+ ♣.+/);
        if (!handMatch) return null;

        const actual = countHCP(handMatch[0]);
        return claimed === actual ? null : actual; // return number, not object
      }
