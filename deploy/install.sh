#!/bin/bash

set -o errexit

Yellow='\033[0;33m'
Green='\033[0;32m'
NC='\033[0m'

echo ""
echo -e "👋 Thank you for trying Argus!"
echo ""
echo -e "${Yellow}⚠️  This install script is deprecated and no longer maintained.${NC}"
echo ""
echo -e "Argus community installs are self-managed and do not use SigNoz Foundry."
echo ""
echo -e "Please see:"
echo -e "${Green}👉 https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/main/deploy/README.md${NC}"
echo -e "${Green}👉 https://argus.example.com/docs/install${NC} (replace with your docs URL)"
echo ""
echo -e "Migration from SigNoz production deployments is not supported — see deploy/MIGRATION.md."
echo ""
echo -e "🙏 Thank you!"
echo ""

exit 0
