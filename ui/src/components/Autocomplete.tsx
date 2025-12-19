import { useState, useRef, useEffect } from 'react';

interface AutocompleteProps {
    fetchSuggestions: (query: string) => Promise<any[]>;
    onSelect: (item: any) => void;
    placeholder?: string;
    renderSuggestion?: (item: any) => React.ReactNode;
    value?: string;
}

export function Autocomplete({
    fetchSuggestions,
    onSelect,
    placeholder = 'Search...',
    renderSuggestion,
    value = '',
}: AutocompleteProps) {
    // Component state and hooks
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState(value || '');
    const debounceTimer = useRef<number | null>(null);

    // Handle form input changes
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setInputValue(newValue);
        onSelect(newValue);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer for 1 second
        debounceTimer.current = setTimeout(async () => {
            // Begin fetching autocomplete suggestions if input length >= 2
            if (newValue.length < 2) {
                setSuggestions([]);
                setShowDropdown(false);
                return;
            }
            setLoading(true);

            // Fetch and display suggestions
            try {
                const results = await fetchSuggestions(newValue);
                setSuggestions(results);
                setShowDropdown(true);
            } catch {
                setSuggestions([]);
                setShowDropdown(false);
            } finally {
                setLoading(false);
            }
        }, 750);
    };

    // Handle user selection
    const handleSelect = (item: any) => {
        setInputValue(item);
        setSuggestions([]);
        setShowDropdown(false);
        onSelect(item);
    };

    // Keep inputValue in sync with value prop (for external updates)
    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    return (
        <div className="relative w-full">
            <input
                type="text"
                className="w-full px-2 rounded focus:outline-none focus:ring-0 placeholder-gray-400"
                value={inputValue}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete="off"
            />
            {loading && (
                <div className="absolute left-0 right-0 bg-white shadow-lg border border-gray-300 z-10 p-2 text-sm">
                    Loading...
                </div>
            )}
            {showDropdown && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 bg-white shadow-lg border border-gray-300 z-10 max-h-60 overflow-y-auto rounded-b-md">
                    {suggestions.map((item, idx) => (
                        <li
                            key={idx}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelect(item)}
                        >
                            {renderSuggestion ? renderSuggestion(item) : item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
