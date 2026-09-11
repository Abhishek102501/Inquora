def clamp_limit(limit: int, default: int = 50, maximum: int = 100) -> int:
    if limit <= 0:
        return default
    return min(limit, maximum)
