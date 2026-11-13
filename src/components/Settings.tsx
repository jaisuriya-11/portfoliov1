import { Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./arc/popover/popover";
import { Switch } from "./arc/switch/switch";
import { setSakura, useSakura } from "../lib/settings";
import { setSound, useSound } from "../lib/sound";

/** Gear button with a small Arc UI panel: on/off switches for the sakura and UI sounds. (Theme lives on the sun/moon button.) */
export default function Settings() {
  const sakura = useSakura();
  const sound = useSound();
  return (
    <Popover>
      <PopoverTrigger className="kbd settings__btn" aria-label="Settings">
        <Settings2 size={15} strokeWidth={1.7} />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="settings">
        <div className="settings__row">
          <span id="set-sakura">Sakura</span>
          <Switch aria-labelledby="set-sakura" checked={sakura} onCheckedChange={setSakura} />
        </div>
        <div className="settings__row">
          <span id="set-sound">Sounds</span>
          <Switch aria-labelledby="set-sound" checked={sound} onCheckedChange={setSound} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
