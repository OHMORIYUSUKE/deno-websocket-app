import { List, ListItem, ListItemText } from "@mui/material";
import { Slide } from "../fetch/types";
import { Dispatch, SetStateAction } from "react";

type SlidesTableProps = {
  slides: Slide[];
  setSlideUrl: Dispatch<SetStateAction<string>>;
};

export const SlidesTable: React.FC<SlidesTableProps> = ({
  slides,
  setSlideUrl,
}) => {
  return (
    <List sx={{ width: "50%", margin: "0 auto" }}>
      {slides.length > 0 && (
        <ListItem sx={{ display: "flex", justifyContent: "center" }}>
          過去に発表したスライド
        </ListItem>
      )}
      {slides.map((slide, index) => (
        <ListItem
          key={index}
          onClick={() => setSlideUrl(slide.url)}
          sx={{
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.1)", // グレーの背景色
            },
          }}
        >
          <ListItemText
            primary={
              <>
                <span style={{ fontSize: "large", marginRight: "0.8em" }}>
                  {slide.title}
                </span>
                <span style={{ fontSize: "small", color: "dimgray" }}>
                  {new Date(slide.createdAt).toLocaleString()}
                </span>
              </>
            }
            secondary={slide.url}
          />
        </ListItem>
      ))}
    </List>
  );
};
