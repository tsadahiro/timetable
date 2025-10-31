import { useState, useEffect } from "react";
import { Box, MenuItem, TextField, Typography } from "@mui/material";
import { supabase } from "../lib/supabaseClient";
import TermDaysManager from "./TermDaysManager";

interface Term {
  id: number;
  name: string;
  year: number;
  start: string;
  end: string;
}

const TermManagerPage = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    const { data, error } = await supabase
      .from("terms")
      .select("id, name, year, start, end")
      .order("year", { ascending: false });

    if (error) console.error(error);
    else setTerms(data);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        学期を選択
      </Typography>

      <TextField
        select
        label="学期"
        value={selectedTerm?.id ?? ""}
        onChange={(e) => {
          const id = Number(e.target.value);
          const term = terms.find((t) => t.id === id) || null;
          setSelectedTerm(term);
        }}
        sx={{ width: 250, mb: 3 }}
      >
        {terms.map((term) => (
          <MenuItem key={term.id} value={term.id}>
            {term.year}年度 {term.name}
          </MenuItem>
        ))}
      </TextField>

      {/* TermDaysManager に選択中の学期を渡す */}
      <TermDaysManager term={selectedTerm} />
    </Box>
  );
};

export default TermManagerPage;
