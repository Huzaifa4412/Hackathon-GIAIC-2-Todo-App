# Todo CLI

A modern command-line todo application with beautiful terminal UI, built with Python and Click.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.12+-green)
![License](https://img.shields.io/badge/license-MIT-orange)

## ✨ Features

- 🎨 **Modern CLI UI** - Beautiful colored tables and formatted output
- 📝 **Add Tasks** - Quick task creation with descriptions
- 🎯 **Priority Levels** - High, Medium, and Low priorities with color coding
- ✅ **Mark Complete** - Track your progress with completion status
- 🗑️ **Delete Tasks** - Clean up your task list
- 📊 **Statistics** - View completion percentage and task counts
- 💾 **Persistent Storage** - JSON file storage with automatic backups
- 🌈 **Rich Terminal UI** - Powered by the Rich library

## 📸 Preview

```
+-------------------------------------------------------------------+
| ID     | Status   | Task                           | Priority    |
+--------+----------+--------------------------------+--------------+
| 16     |    -     | Build modern UI                 | HIGH         |
| 17     |    -     | Write tests                     | MEDIUM       |
| 18     |    +     | Deploy app                      | LOW          |
+-------------------------------------------------------------------+

Stats
  Total Tasks: 16
  Completed: 3 (19%)
  High Priority: 6
```

## 🚀 Installation

```bash
git clone https://github.com/Huzaifa4412/Hackathon-GIAIC-2-Todo-App-Phase-1.git
cd Hackathon-GIAIC-2-Todo-App-Phase-1
pip install -e .
```

### Development Installation

```bash
pip install -e ".[dev]"
```

## 💻 Usage

### Adding Tasks

```bash
# Add a task with medium priority (default)
todo add "Buy groceries"

# Add a task with high priority
todo add "Urgent task" --priority high

# Add a task with low priority
todo add "Quick fix" -p low
```

### Listing Tasks

```bash
# List all tasks with statistics
todo list
```

### Completing Tasks

```bash
# Mark task as complete
todo complete 1
```

### Deleting Tasks

```bash
# Delete a task
todo delete 1
```

### Getting Help

```bash
# Show general help
todo --help

# Show command-specific help
todo add --help
todo list --help
todo complete --help
todo delete --help
```

## 🎨 Priority Colors

- 🔴 **HIGH** - Urgent tasks that need immediate attention
- 🟡 **MEDIUM** - Standard priority tasks (default)
- 🔵 **LOW** - Tasks that can be done later

## 📂 Data Storage

Tasks are stored in `~/.todo.json` by default. The application automatically:

- Creates backups (keeps last 3 versions)
- Uses atomic writes for data safety
- Attempts to restore from backups if corruption is detected

### Custom File Location

```bash
# Use a custom file location
todo --file /path/to/custom.json add "Task"
```

## 🧪 Development

### Running Tests

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=src/todo_cli --cov-report=html
```

### Code Quality

```bash
# Lint code
ruff check src/

# Format code
black src/

# Type check
mypy src/todo_cli/
```

## 📦 Project Structure

```
src/todo_cli/
├── __init__.py
├── cli.py              # Main CLI entry point
├── commands/           # CLI commands
│   ├── add.py          # Add task command
│   ├── list.py         # List tasks command
│   ├── complete.py     # Complete task command
│   └── delete.py       # Delete task command
├── models/             # Data models
│   └── task.py         # Task and TaskList models
├── storage/            # Data persistence
│   └── file_store.py   # File-based storage with backups
└── ui/                 # UI styling
    └── styles.py       # Rich terminal formatting

tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
└── contract/           # Contract tests

docs/                   # Documentation
.specify/              # Spec-Driven Development artifacts
.history/              # Prompt history and ADRs
```

## 🛠️ Tech Stack

- **Python 3.12+** - Modern Python with type hints
- **Click 8.1+** - Elegant CLI framework
- **Rich 13.0+** - Beautiful terminal output
- **pytest** - Testing framework
- **JSON** - Data persistence format

## 📊 Code Quality

- **85%** overall code coverage
- **31 passing tests**
- Type hints throughout
- Ruff linting compliant
- Follows Spec-Driven Development methodology

## 🔐 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 Roadmap

- [ ] Add task editing functionality
- [ ] Add task search/filter
- [ ] Add due dates
- [ ] Add tags/categories
- [ ] Add task notes/descriptions
- [ ] Add export to different formats (Markdown, CSV)
- [ ] Add cloud sync support

## 👨‍💻 Built For

GIAIC Hackathon - Phase 1

## 🙏 Acknowledgments

- [Click](https://click.palletsprojects.com/) - Python CLI framework
- [Rich](https://rich.readthedocs.io/) - Terminal formatting library
- Spec-Driven Development methodology
