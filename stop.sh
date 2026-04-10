#!/bin/bash

echo "Servisler durduruluyor..."

pkill -f "node server/index.js" 2>/dev/null
pkill -f "vite" 2>/dev/null

echo "Tum servisler durduruldu."
