import { useState } from 'react';

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
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);

    // Handle input changes
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);
        if (value.length < 2) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }
        setLoading(true);
        try {
            const results = await fetchSuggestions(value);
            setSuggestions(results);
            setShowDropdown(true);
        } catch (err) {
            setSuggestions([]);
            setShowDropdown(false);
        } finally {
            setLoading(false);
        }
    };

    // Handle user selection
    const handleSelect = (item: any) => {
        setInput(item);
        setSuggestions([]);
        setShowDropdown(false);
        onSelect(item);
    };

    return (
        <div className="relative w-full">
            <input
                type="text"
                className="w-full px-2 rounded focus:outline-none focus:ring-0 placeholder-gray-400"
                value={input}
                onChange={handleChange}
                placeholder={placeholder}
                autoComplete="off"
            />
            {loading && (
                <div className="absolute left-0 right-0 bg-white border-t z-10 p-2 text-sm">
                    Loading...
                </div>
            )}
            {showDropdown && suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 bg-white border-t z-10 max-h-60 overflow-y-auto rounded-b">
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
