import sys

def find_mismatch(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        code = f.read()
    
    stack = []
    line_no = 1
    col_no = 1
    i = 0
    n = len(code)
    
    in_string = None # Can be ', ", or `
    in_comment = None # Can be 'single' (//) or 'multi' (/*)
    
    while i < n:
        char = code[i]
        
        # Track line and column numbers
        if char == '\n':
            line_no += 1
            col_no = 1
        else:
            col_no += 1
            
        # Handle comments
        if in_comment == 'single':
            if char == '\n':
                in_comment = None
            i += 1
            continue
        elif in_comment == 'multi':
            if char == '*' and i + 1 < n and code[i+1] == '/':
                in_comment = None
                i += 2
                col_no += 1
                continue
            i += 1
            continue
            
        # Handle strings (if not in comment)
        if in_string:
            if char == '\\': # skip escaped char
                i += 2
                col_no += 1
                continue
            if char == in_string:
                in_string = None
            i += 1
            continue
            
        # Detect start of comments
        if char == '/' and i + 1 < n:
            if code[i+1] == '/':
                in_comment = 'single'
                i += 2
                col_no += 1
                continue
            elif code[i+1] == '*':
                in_comment = 'multi'
                i += 2
                col_no += 1
                continue
                
        # Detect start of strings
        if char in ["'", '"', '`']:
            in_string = char
            i += 1
            continue
            
        # Push opening braces/parentheses/brackets to stack
        if char in ['(', '[', '{']:
            stack.append((char, line_no, col_no - 1, i))
            
        # Pop matching closing elements
        elif char in [')', ']', '}']:
            if not stack:
                print(f"Error: Unmatched closing '{char}' at line {line_no}, col {col_no - 1}")
                print(f"Context: ... {code[max(0, i-40):i+1]} ...")
                return False
            
            top_char, top_line, top_col, top_idx = stack.pop()
            matches = {')': '(', ']': '[', '}': '{'}
            if matches[char] != top_char:
                print(f"Error: Mismatched closing '{char}' at line {line_no}, col {col_no - 1}.")
                print(f"It does not match opening '{top_char}' at line {top_line}, col {top_col}")
                print(f"Opening context: ... {code[max(0, top_idx-40):top_idx+20]} ...")
                print(f"Closing context: ... {code[max(0, i-40):i+20]} ...")
                return False
                
        i += 1
        
    if stack:
        print(f"Error: {len(stack)} unclosed opening elements remain:")
        for char, line, col, idx in stack:
            print(f"Unclosed '{char}' at line {line}, col {col}")
            print(f"Context: ... {code[max(0, idx-20):idx+40]} ...")
        return False
        
    print("No simple parenthesis/bracket/brace mismatches found.")
    return True

print("\nChecking offline-portal.html:")
find_mismatch('c:/id card/offline-portal.html')
print("\nChecking legacy/app.js:")
find_mismatch('c:/id card/legacy/app.js')
