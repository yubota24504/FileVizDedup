import os

def scan_directory(path):
    """
    Recursively scans the directory and returns a tree structure.
    """
    name = os.path.basename(path)
    if name == "":
        name = path
        
    node = {
        "name": name,
        "path": path,
        "type": "directory",
        "children": [],
        "size": 0
    }
    
    try:
        # Check permissions or issues
        if not os.access(path, os.R_OK):
             return node
             
        with os.scandir(path) as it:
            for entry in it:
                if entry.is_file():
                    try:
                        stat = entry.stat()
                        size = stat.st_size
                        node["children"].append({
                            "name": entry.name,
                            "path": entry.path,
                            "type": "file",
                            "size": size,
                            "extension": os.path.splitext(entry.name)[1].lower()
                        })
                        node["size"] += size
                    except Exception:
                        pass # Skip files we can't access
                elif entry.is_dir():
                    try:
                        child_node = scan_directory(entry.path)
                        node["children"].append(child_node)
                        node["size"] += child_node["size"]
                    except RecursionError:
                        pass # deeply nested
                    except Exception:
                        pass
    except PermissionError:
        pass
    except Exception as e:
        print(f"Error scanning {path}: {e}")

    return node
