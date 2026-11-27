import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";
export function PageHeader({ title, subtitle, children }: { title:string; subtitle:string; children?:ReactNode }) {
  return <Box component="header" sx={{display:"flex", justifyContent:"space-between",alignItems:"center",gap:2,flexWrap:"wrap"}}>
    <div><Typography component="h1" variant="h5">{title}</Typography><Typography variant="body2" color="text.secondary">{subtitle}</Typography></div>{children}
  </Box>;
}
export function Metrics({ items }: {items:[string,string | number][]}) {
  return <Box sx={{display:"grid",gridTemplateColumns:{xs:"repeat(2,minmax(0,1fr))",lg:`repeat(${items.length},minmax(0,1fr))`},gap:2}}>
    {items.map(([name,value])=><Paper key={name} sx={{p:{xs:1.5,sm:2.5},overflowWrap:"anywhere"}}><Typography variant="body2" color="text.secondary">{name}</Typography><Typography variant="h6" component="p" sx={{mt:1,fontVariantNumeric:"tabular-nums"}}>{value}</Typography></Paper>)}
  </Box>;
}
