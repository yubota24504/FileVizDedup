import os
import hashlib
from collections import defaultdict

def get_file_hash(filepath, block_size=65536):
    """
    Generates SHA256 hash specific to the file
    """
    sha256 = hashlib.sha256()
    try:
        with open(filepath, 'rb') as f:
            while True:
                data = f.read(block_size)
                if not data:
                    break
                sha256.update(data)
        return sha256.hexdigest()
    except Exception:
        return None

def find_duplicates(root_path):
    """
    Finds duplicate files in the given directory.
    Strategy:
    1. Group by size (fast)
    2. Group by first 1k bytes (optional optimization, skipped for simplicity/robustness)
    3. Group by full hash
    """
    
    # 1. Group by size
    size_map = defaultdict(list)
    
    for root, dirs, files in os.walk(root_path):
        for name in files:
            filepath = os.path.join(root, name)
            try:
                size = os.path.getsize(filepath)
                if size > 0: # Skip empty files? Maybe keep them. Let's keep > 0 for now as dup empty files are less interesting.
                    size_map[size].append(filepath)
            except Exception:
                pass

    # Filter out unique sizes
    potential_duplicates = {k: v for k, v in size_map.items() if len(v) > 1}
    
    # 2. Group by Hash
    duplicates = []
    
    for size, paths in potential_duplicates.items():
        hash_map = defaultdict(list)
        for path in paths:
            file_hash = get_file_hash(path)
            if file_hash:
                hash_map[file_hash].append(path)
        
        for file_hash, paths in hash_map.items():
            if len(paths) > 1:
                duplicates.append({
                    "hash": file_hash,
                    "size": size,
                    "paths": paths,
                    "wasted": size * (len(paths) - 1)
                })

    # Sort by size (descending) to show largest wasted space first
    duplicates.sort(key=lambda x: x["wasted"], reverse=True)
    
    return duplicates
