import re

def check_jsx_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        code = f.read()
        
    n = len(code)
    i = 0
    line_no = 1
    col_no = 1
    
    in_string = None
    in_comment = None
    
    tags_stack = []
    tag_name_re = re.compile(r'^[a-zA-Z][a-zA-Z0-9.-]*$')
    
    while i < n:
        char = code[i]
        
        # Track line/col
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
                col_no += 2
                continue
            i += 1
            continue
            
        # Handle strings
        if in_string:
            if char == '\\':
                i += 2
                col_no += 2
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
                col_no += 2
                continue
            elif code[i+1] == '*':
                in_comment = 'multi'
                i += 2
                col_no += 2
                continue
                
        # Detect start of strings
        if char in ["'", '"', '`']:
            in_string = char
            i += 1
            continue
            
        # Detect JSX tags
        if char == '<':
            if i + 1 < n:
                next_char = code[i+1]
                
                # Check for closing tag: </Name>
                if next_char == '/':
                    # Find end of tag '>', but skipping braces if any (usually none in close tags)
                    end_idx = i + 2
                    while end_idx < n and code[end_idx] != '>':
                        end_idx += 1
                    if end_idx < n:
                        tag_content = code[i+2:end_idx].strip()
                        tag_name = tag_content.split()[0] if tag_content else ""
                        if tag_name_re.match(tag_name):
                            tags_stack.append(('close', tag_name, line_no, col_no - 1, i))
                        i = end_idx + 1
                        col_no += (end_idx - i)
                        continue
                
                # Check for opening fragment: <>
                elif next_char == '>':
                    tags_stack.append(('open_fragment', '', line_no, col_no - 1, i))
                    i += 2
                    col_no += 2
                    continue
                    
                # Check if it starts with valid tag char
                elif next_char.isalpha() or next_char == '_':
                    # Parse tag up to '>', respecting brace depth
                    end_idx = i + 1
                    brace_depth = 0
                    in_attr_str = None
                    
                    while end_idx < n:
                        c = code[end_idx]
                        
                        if in_attr_str:
                            if c == '\\':
                                end_idx += 2
                                continue
                            if c == in_attr_str:
                                in_attr_str = None
                            end_idx += 1
                            continue
                            
                        if c in ["'", '"', '`']:
                            in_attr_str = c
                            end_idx += 1
                            continue
                            
                        if c == '{':
                            brace_depth += 1
                        elif c == '}':
                            brace_depth -= 1
                        elif c == '>' and brace_depth == 0:
                            break
                        end_idx += 1
                        
                    if end_idx < n:
                        tag_content = code[i+1:end_idx].strip()
                        
                        is_self_closing = False
                        if tag_content.endswith('/'):
                            is_self_closing = True
                            tag_content = tag_content[:-1].strip()
                            
                        if tag_content:
                            parts = tag_content.split()
                            tag_name = parts[0]
                            
                            if tag_name_re.match(tag_name):
                                if is_self_closing:
                                    pass
                                else:
                                    tags_stack.append(('open', tag_name, line_no, col_no - 1, i))
                        
                        i = end_idx + 1
                        col_no += (end_idx - i)
                        continue
                        
        i += 1
        
    print(f"Total JSX tags parsed (excluding self-closing): {len(tags_stack)}")
    
    open_stack = []
    for item in tags_stack:
        type_ = item[0]
        name = item[1]
        line = item[2]
        col = item[3]
        idx = item[4]
        
        if type_ == 'open' or type_ == 'open_fragment':
            open_stack.append(item)
        elif type_ == 'close':
            if not open_stack:
                print(f"Error: Unmatched closing tag '</{name}>' at line {line}, col {col}")
                print(f"Context: ... {code[max(0, idx-40):idx+20]} ...")
                return False
            
            top = open_stack.pop()
            top_type = top[0]
            top_name = top[1]
            top_line = top[2]
            top_col = top[3]
            top_idx = top[4]
            
            if top_type == 'open_fragment' and name != '':
                print(f"Error: Mismatched closing tag '</{name}>' at line {line}, col {col}.")
                print(f"It tried to close opening fragment '<>' at line {top_line}, col {top_col}")
                return False
            elif top_type == 'open' and name != top_name:
                print(f"Error: Mismatched closing tag '</{name}>' at line {line}, col {col}.")
                print(f"It does not match opening tag '<{top_name}>' at line {top_line}, col {top_col}")
                print(f"Opening context: ... {code[max(0, top_idx-40):top_idx+40]} ...")
                print(f"Closing context: ... {code[max(0, idx-40):idx+40]} ...")
                return False
                
    if open_stack:
        print(f"Error: {len(open_stack)} unclosed JSX tags remain:")
        for type_, name, line, col, idx in open_stack:
            tag_str = "<>" if type_ == 'open_fragment' else f"<{name}>"
            print(f"Unclosed tag '{tag_str}' at line {line}, col {col}")
            print(f"Context: ... {code[max(0, idx-20):idx+40]} ...")
        return False
        
    print("JSX tags are perfectly balanced!")
    return True

print("\nChecking offline-portal.html:")
check_jsx_balance('c:/id card/offline-portal.html')
print("\nChecking legacy/app.js:")
check_jsx_balance('c:/id card/legacy/app.js')
